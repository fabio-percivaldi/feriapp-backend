/*
 * Copyright 2019 Mia srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint require-await: 0 */
'use strict'

const customService = require('@mia-platform/custom-plugin-lib')()
const bridgesSchema = require('./src/schemas/bridges')
const getHolidaysByCitySchema = require('./src/schemas/getHolidaysByCity')
const getIgMediaSchema = require('./src/schemas/getIgMedia')
const { bridges, getHolidaysByCity } = require('./src/handlers/bridgesHandler')
const { getIgMedia } = require('./src/handlers/igHandler')

module.exports = customService(async function index(service) {
  service.addRawCustomPlugin('POST', '/bridges', bridges, bridgesSchema)
  service.addRawCustomPlugin('GET', '/getHolidaysByCity', getHolidaysByCity, getHolidaysByCitySchema)
  service.addRawCustomPlugin('GET', '/igMedia', getIgMedia, getIgMediaSchema)
})
