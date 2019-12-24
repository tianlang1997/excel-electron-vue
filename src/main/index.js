'use strict'

import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const MENETYPE = {
  FILE: 1,
  DIRECTORY: 2
}
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  console.log('createWindow')
  mainWindow.loadURL(winURL)
  /* 获取electron窗体的菜单栏 */
  /* 隐藏electron创听的菜单栏 */

  // 设置菜单
  let dockMenu = Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        {
          label: '打开文件',
          click: function () {
            console.log('打开文件')
            MenuDialog(MENETYPE.FILE, (_err, res) => {
              if (res && res.length > 0) {
                console.log(res[0])
                mainWindow.webContents.send('open-file-dialog', res)
              }
            })
          }
        },
        {
          label: '打开文件夹',
          click: function () {
            MenuDialog(MENETYPE.DIRECTORY, (_err, res) => {
              if (res && res.length > 0) {
                console.log(res[0])
                mainWindow.webContents.send('open-directory-dialog', res[0])
              }
            })
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '不提供帮助！'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(dockMenu)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  ipcMain.on('open-file-dialog', (ret) => {
    MenuDialog(MENETYPE.FILE, (_err, res) => {
      if (res && res.length > 0) {
        console.log(res[0])
        mainWindow.webContents.send('open-file-dialog', res)
      }
    })
  })
}

function MenuDialog (type, callback) {
  let opts
  switch (type) {
    case MENETYPE.FILE:
      opts = {
        properties: [
          'openFiles',
          'multiSelections',
          'createDirectory'
        ],
        filters: [
          { name: 'Excel', extensions: ['xlsx', 'xls'] }
        ]
      }
      break
    case MENETYPE.DIRECTORY:
      opts = {
        properties: [
          'openDirectory'
        ]
      }
      break
    default:
  }
  if (!opts) {
    return false
  }
  dialog.showOpenDialog(opts, function (res) {
    callback(null, res)
  })
  return true
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
