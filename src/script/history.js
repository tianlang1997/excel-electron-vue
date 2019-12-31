import * as Config from '../config'
import { remote } from 'electron'
import moment from 'moment'
const fs = require('fs')
const path = require('path')
const configDir = remote.app.getPath('userData')
let historyList = []
const historyDir = path.join(configDir, Config.getHistoryDir())
const TempHistoryFile = path.join(historyDir, 'temp')
const History = 'record'
const IndexFile = path.join(historyDir, 'index')
let IndexArr
// const IndexBase = 'index'
export function appendHistory (record) {
  historyList.push(JSON.stringify([record, Date.now()]))
}

export function flushHistory () {
  if (historyList.length === 0) return
  let content = historyList.join('\n')
  historyList = []
  fs.appendFileSync(path.join(historyDir, TempHistoryFile), content)
}

export function storeIndex () {
  let record = moment().format('YYYY-MM')
  getIndexFile()
  if (IndexArr) {
    if (IndexArr[IndexArr.length - 1] !== record) {
      fs.appendFileSync(IndexFile, record + '\n')
      IndexArr.push(record)
    }
  } else {
    fs.appendFileSync(IndexFile, record + '\n')
    IndexArr = [record]
  }
}

export function getIndexFile () {
  if (IndexArr) {
    if (fs.existsSync(IndexFile)) {
      let content = fs.readFile(IndexFile)
      IndexArr = content.toString().split('\n')
      return IndexArr
    }
  } else {
    return []
  }
}

function _getHistory (date) {
  let indexArr = getIndexFile()
  let file = History + date
  if (indexArr.indexOf(date) === -1) {
    return {}
  }
  if (fs.existsSync(path.join(historyDir, file))) {
    let content = fs.readFileSync(file)
    return JSON.parse(content)
  } else {
    if (fs.existsSync(path.join(historyDir, file))) {
      let content = fs.readFileSync(file)
      return JSON.parse(content)
    } else {
      return {}
    }
  }
}

export function getHistory () {
  // let indexArr = getIndexFile()
  return _getHistory(moment().format('YYYY-MM'))
}