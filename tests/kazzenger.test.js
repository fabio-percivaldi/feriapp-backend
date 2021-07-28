'use strict'

const tap = require('tap')
const Kazzenger = require('../src/kazzenger')
const moment = require('moment')

tap.test('kazzenger function', t => {
  t.test('ok - return correclty', assert => {
    const config = { country: 'IT', state: '', region: '', city: 'Milan', daysOff: [0, 6], customHolidays: null }
    const kazzenger = new Kazzenger(config)
    const expectedResponse = [
      {
        start: moment('2019-12-21T00:00:00.000Z').utc()
          .toDate(),
        end: moment('2019-12-26T00:00:00.000Z').utc()
          .toDate(),
        holidaysCount: 4,
        weekdaysCount: 2,
        daysCount: 6 },
      { start: moment('2019-12-25T00:00:00.000Z').utc()
        .toDate(),
      end: moment('2019-12-29T00:00:00.000Z').utc()
        .toDate(),
      holidaysCount: 4,
      weekdaysCount: 1,
      daysCount: 5 }]
    const actualResponse = kazzenger.bridges({
      start: moment('2019-09-01T00:00:00.000Z').utc()
        .toDate(),
      end: moment('2019-12-31T00:00:00.000Z').utc()
        .toDate(),
      maxHolidaysDistance: 2,
      maxAvailability: 2,
    })
    assert.strictSame(actualResponse, expectedResponse)
    assert.end()
  })
  t.end()
})


