import * as xlsx from 'xlsx'

export function exportExcel (dataStore, filePath) {
  // json 数据
  var data = [{
    'a': 1,
    'x': 2,
    'b': 3,
    'y': 4,
    'success': true
  }, {
    'a': 1,
    'x': 2,
    'b': 3,
    'y': 4,
    'success': false
  }
  ]
  // 数据表格
  var table = []
  table.push({
    A: '列A',
    B: '列B',
    C: '列C',
    D: '列D',
    E: '列E'
  })
  data.forEach(function (item) {
    var row = {
      A: item.b,
      B: item.y,
      C: item.a,
      D: item.x,
      E: (item.success ? '成功' : '失败')
    }
    table.push(row)
  })
  // 创建book
  var wb = xlsx.utils.book_new()
  // json转sheet
  var ws = xlsx.utils.json_to_sheet(table, {header: ['A', 'B', 'C', 'D', 'E'], skipHeader: true})
  // 设置列宽
  ws['!cols'] = [
    {width: 15},
    {width: 15},
    {width: 15},
    {width: 15},
    {width: 10}
  ]
  // sheet写入book
  xlsx.utils.book_append_sheet(wb, ws, 'file')
  // 输出
  xlsx.writeFile(wb, filePath)
}

export function resolveExcel (fileList, dataMap) {
  for (let i = 0, len = fileList.length; i < len; ++i) {
    let element = fileList[i]
    if (typeof dataMap[element.path] !== 'number') continue
    let workbook = xlsx.readFile(element.path)
    for (let i = 0; i < workbook.SheetNames.length; ++i) {
      // console.log(workbook.SheetNames[i])
      let sheetName = workbook.SheetNames[i]
      let addressOfCell = 'A1' // 提供一个引用样式(单元格下标)
      let worksheet = workbook.Sheets[sheetName] // 获取对应的工作表对象
      let desiredCell = worksheet[addressOfCell] // 获取对应的单元格对象
      let desiredValue = (desiredCell ? desiredCell.v : undefined) // 获取对应单元格中的数据
      console.log(desiredValue)
    }
    dataMap[element.path] = workbook
  }
  return dataMap
}
