import * as Config from '../config'
import { remote } from 'electron'
import moment from 'moment'
const fs = require('fs')
const path = require('path')
const configDir = remote.app.getPath('userData')
let historyList = []
const historyDir = path.join(configDir, Config.getHistoryDir())
// const DataBase = 'data'
// const IndexBase = 'index'
let lastTime = moment().format('YYMMDD')
let dataStore = {}
export function appendHistory (record) {
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir)
  }
  if (lastTime !== moment().format('YYMMDD')) {
    flushHistory()
  }
  dataStore[record] = Date.now()
}

export function flushHistory () {
  if (historyList.length === 0) return
  let fileName = moment().format('YYYY-MM-DD')
  let content = historyList.join('')
  historyList = []
  fs.appendFileSync(path.join(historyDir, fileName), content)
}

export function getHistory () {
  console.log('')
}
