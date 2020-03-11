/* eslint-disable global-require */
'use strict'

const moment = require('moment')
const Holidays = require('date-holidays')
const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24
const PUBLIC_HOLIDAY = 'public'
const addHolidays = (holidays, holidaysLib = this.holidays) => {
  const currentHolidays = holidaysLib.getHolidays()
  holidaysLib.init(this.country, this.state, this.region)

  holidays.forEach(holiday => {
    const foundHoliday = currentHolidays.find(current => {
      const date1 = moment(current.date).format('YYYY-MM-DD')
      const date2 = moment(holiday.date).format('YYYY-MM-DD')
      return date1 === date2
    })

    if (foundHoliday) {
      currentHolidays.splice(currentHolidays.indexOf(foundHoliday), 1)
    } else {
      currentHolidays.push({ date: moment(holiday.date), name: holiday.name })
    }
  })
  currentHolidays.forEach(holiday => {
    const formattedDate = moment(holiday.date).format('MM-DD')
    holidaysLib.setHoliday(formattedDate, holiday.name)
  })
}
function Kazzenger({ country, daysOff, customHolidays }) {
  this.daysOff = daysOff || [0, 6]
  this.holidays = new Holidays()
  this.country = country
  this.holidays.init(this.country)
  if (customHolidays) {
    addHolidays(customHolidays, this.holidays)
  }
}

Kazzenger.prototype.isHolidayOrWeekend = function isHolidayOrWeekend(momentDay) {
  const isWeekend = this.daysOff.includes(parseInt(momentDay.format('d')))
  const holidays = this.holidays.getHolidays().filter(holiday => holiday.type === PUBLIC_HOLIDAY)
  const foundholiday = holidays.find(holiday => moment(holiday.date).format('MM-DD') === momentDay.format('MM-DD'))
  return {
    isWeekend,
    isHoliday: Boolean(foundholiday),
    holidayName: foundholiday ? foundholiday.name : null,
  }
}

Kazzenger.prototype.isDayOff = function isDayOff(date) {
  return this.daysOff.indexOf(date.getDay()) !== (-1)
}

Kazzenger.prototype.getHolidays = function getHolidays(start, end) {
  if (start.getFullYear() === end.getFullYear()) {
    return this.holidays.getHolidays(start).filter(holiday => holiday.type === PUBLIC_HOLIDAY)
  }
  let holidays = this.holidays.getHolidays(start)
  for (let year = start.getFullYear() + 1; year <= end.getFullYear(); year++) {
    holidays = holidays.concat(this.holidays.getHolidays(year).filter(holiday => holiday.type === PUBLIC_HOLIDAY))
  }
  return holidays
}

Kazzenger.prototype.isHolidayOptimized = function isHolidayOptimized(date, holidays, offset) {
  if (this.isDayOff(date)) {
    return { isHoliday: true, offset }
  }
  for (let index = offset; index < holidays.length; index++) {
    const holiday = holidays[index]
    if (holiday.start >= date) {
      return { isHoliday: false, offset: index }
    } else if (date >= holiday.start && date <= holiday.end) {
      return { isHoliday: true, offset: index }
    }
  }
  return { isHoliday: false, offset }
}

function createBridge() {
  return {
    start: undefined,
    end: undefined,
    holidaysCount: 0,
    potentialWeekdaysCount: 0,
    weekdaysCount: 0,
    daysCount: 0,
  }
}

function bridgesHandleHoliday(data) {
  if (data.potentialBridges.length === 0 || (data.maxAvailability && data.lastHolidayDistance !== 0)) {
    data.potentialBridges.push(createBridge())
  }
  data.potentialBridges.forEach(bridge => {
    bridge.holidaysCount += 1
    if (!bridge.start) {
      bridge.start = data.date
    } else {
      bridge.weekdaysCount = bridge.potentialWeekdaysCount
      bridge.end = data.date
    }
  })
  data.lastHolidayDistance = 0
}

function bridgesHandleWeekday(data) {
  data.lastHolidayDistance += 1
  if (data.lastHolidayDistance > data.maxHolidaysDistance) {
    bridgesHandleCloseAll(data)
    return
  }
  for (let index = 0; index < data.potentialBridges.length; ++index) {
    const bridge = data.potentialBridges[index]
    bridge.potentialWeekdaysCount += 1
    if (bridge.potentialWeekdaysCount > data.maxAvailability) {
      bridgesHandleClose(data, bridge, index)
      index -= 1
    }
  }
}

function bridgesHandleIsBridge(bridge, data) {
  return bridge.end
    && (bridge.weekdaysCount > 0 && bridge.holidaysCount > data.daysOff.length)
    && (bridge.end !== bridge.start)
    && (bridge.end > data.lastEndBridgeDate)
}

function bridgesHandleClose(data, bridge, index) {
  if (bridgesHandleIsBridge(bridge, data)) {
    bridge.daysCount = bridge.holidaysCount + bridge.weekdaysCount
    delete bridge.potentialWeekdaysCount
    data.result.push(bridge)
    data.lastEndBridgeDate = bridge.end
  }
  data.potentialBridges.splice(index, 1)
}

function bridgesHandleCloseAll(data) {
  for (let index = 0; index < data.potentialBridges.length; ++index) {
    const bridge = data.potentialBridges[index]
    bridgesHandleClose(data, bridge, index)
    index -= 1
  }
}
const getAdiacentBridge = (bridges, holidayDate) => {
  const foundBridge = {
    bridgeId: null,
    isBefore: false,
  }
  bridges.forEach(bridge => {
    const dayBeforeStart = moment(bridge.start).subtract(1, 'days')
    const dayAfterEnd = moment(bridge.end).add(1, 'days')
    if (holidayDate.isSame(dayBeforeStart, 'days')) {
      foundBridge.bridgeId = bridge.id
      foundBridge.isBefore = true
    }
    if (holidayDate.isSame(dayAfterEnd, 'days')) {
      foundBridge.bridgeId = bridge.id
    }
  })
  return foundBridge
}
const updateBridge = (bridge, isBefore, holidayDate) => {
  if (isBefore) {
    bridge.start = holidayDate.toDate()
  } else {
    bridge.end = holidayDate.toDate()
  }
  bridge.id = `${moment(bridge.start).format('YYYY-MM-DD')}-${moment(bridge.end).format('YYYY-MM-DD')}`
  bridge.holidaysCount += 1
  bridge.daysCount += 1
}

Kazzenger.prototype.findWeekendBridge = function findWeekendBridge(holidays) {
  const bridges = []
  holidays.forEach(holiday => {
    const holidayDate = moment(`${holiday.date}Z`)
    if (holidayDate.isBefore(moment())) {
      return
    }
    const holidayWeekDay = holidayDate.weekday()
    let bridgeStart
    let bridgeEnd
    if (holidayWeekDay === 1) {
      bridgeStart = moment(holidayDate).subtract(2, 'days')
      bridgeEnd = holidayDate
    }
    if (holidayWeekDay === 5) {
      bridgeEnd = moment(holidayDate).add(2, 'days')
      bridgeStart = holidayDate
    }
    if (bridgeStart && bridgeEnd) {
      const bridgeId = `${bridgeStart.format('YYYY-MM-DD')}-${bridgeEnd.format('YYYY-MM-DD')}`

      const bridge = {
        id: bridgeId,
        holidayDate: holidayDate.toDate(),
        start: bridgeStart.toDate(),
        end: bridgeEnd.toDate(),
        holidaysCount: 3,
        weekdaysCount: 0,
        daysCount: 3,
      }
      bridges.push(bridge)
    }
  })
  holidays.forEach(holiday => {
    const holidayDate = moment(`${holiday.date}Z`)
    if (holidayDate.isBefore(moment())) {
      return
    }
    const adiacentBridge = getAdiacentBridge(bridges, holidayDate)
    if (adiacentBridge.bridgeId) {
      const existingBridge = bridges.find(bridge => bridge.id === adiacentBridge.bridgeId)
      updateBridge(existingBridge, adiacentBridge.isBefore, holidayDate)
    }
  })
  return bridges
}
Kazzenger.prototype.bridges = function bridges({ start, end, maxHolidaysDistance, maxAvailability }) {
  const data = {
    daysOff: this.daysOff,
    maxHolidaysDistance,
    maxAvailability,
    result: [],
    lastHolidayDistance: 0,
    potentialBridges: [],
    lastEndBridgeDate: null,
    date: start,
  }
  const holidays = this.getHolidays(start, end).sort((aaa, bbb) => aaa.start - bbb.start)
  if (maxAvailability === 0) {
    const weekendBridges = this.findWeekendBridge(holidays)
    return weekendBridges
  }
  let offset = 0
  while (data.date <= end) {
    const { isHoliday, offset: nextOffset } = this.isHolidayOptimized(data.date, holidays, offset)
    offset = nextOffset
    if (isHoliday) {
      bridgesHandleHoliday(data)
    } else {
      bridgesHandleWeekday(data)
    }
    data.date = new Date(data.date.getTime() + MILLISECONDS_IN_A_DAY)
  }
  bridgesHandleCloseAll(data)
  return data.result
}

function bridgesByYearsCreateKey(bridge) {
  const startYear = bridge.start.getFullYear()
  const endYear = bridge.end.getFullYear()
  if (startYear === endYear) {
    return `${startYear}`
  }
  return `${startYear},${endYear}`
}

function bridgesByYearsKeyToArray(key) {
  return key.split(',').map(year => parseInt(year, 10))
}
Kazzenger.prototype.bridgesByYears = function bridgesByYears(input) {
  const calculatedBridges = this.bridges(input)
  const mapByYears = calculatedBridges.reduce((acc, bridge) => {
    const key = bridgesByYearsCreateKey(bridge)
    const bridges = acc[key] || []
    bridges.push(bridge)
    acc[key] = bridges
    return acc
  }, {})
  return Object.keys(mapByYears)
    .sort()
    .reduce((acc, key) => {
      const bridges = mapByYears[key]
      const stats = bridges
        .reduce((accc, bridge) => {
          accc.holidaysCount += bridge.holidaysCount
          accc.weekdaysCount += bridge.weekdaysCount
          accc.daysCount += bridge.daysCount
          return accc
        }, { holidaysCount: 0, weekdaysCount: 0, daysCount: 0 })
      acc.push({
        years: bridgesByYearsKeyToArray(key),
        bridges,
        ...stats,
      })
      return acc
    }, [])
}

Kazzenger.prototype.rateBridge = function rateBridge(bridge) {
  return (bridge.daysCount / (bridge.weekdaysCount || 1) * (bridge.daysCount / 30) * 100).toFixed(0)
}

module.exports = Kazzenger
