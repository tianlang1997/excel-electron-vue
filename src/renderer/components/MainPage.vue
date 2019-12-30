<template>
  <div id="mainPage">
    <div id="dragFile" ref="dragFile" @click.right="rightBoxEvent()">
      <span v-if='fileList.length<9'>文件拖拽到这里</span>
    </div>
    <div class="filebox">
      <ol>
        <li class="fileItem" v-for="(item,index) in fileList" @click.right="rightEvent(index)"><a><span class="fileName"><span class="Index">{{index+1}}:</span>{{item.name}}</span><span title="删除" class="fileDelete" @click = "deleteItem(index)">x</span></a></li>
      </ol>
    </div>
    <div id= "exportResult" ref="exportResult">导 出</div>
    <!-- <router-link :to="{path:'/landing-page'}">landing-page</router-link> -->
  </div>
</template>

<script>
  // import SystemInformation from './LandingPage/SystemInformation'
  import { ipcRenderer, remote } from 'electron'
  import { exportExcel, resolveExcel } from './../../script/resolveExcel'
  const fs = require('fs')
  const path = require('path')
  export default {
    name: 'main-page',
    data () {
      return {
        infoshow: false,
        fileList: [],
        dataMap: {},
        itemMenu: remote.menu,
        fileBoxMenu: remote.fileBoxMenu,
        curFileIndex: -1
      }
    },
    components: {},
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      resolvePath (filePath) {
        let tempArr = filePath.split('\\')
        let name = tempArr[tempArr.length - 1]
        return {name: name, path: filePath}
      },
      resolveDirectory (directory) {
        let that = this
        fs.readdir(directory, function (err, files) {
          if (err) {
            console.warn(err)
          } else {
            // 遍历读取到的文件列表
            files.forEach(function (filename) {
              // 获取当前文件的绝对路径
              if (filename.indexOf('.xlsx') > -1 || filename.indexOf('.xls') > -1) {
                var filedir = path.join(directory, filename)
                // 根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (err, stats) {
                  if (err) {
                    console.warn('获取文件stats失败')
                  } else {
                    var isFile = stats.isFile()// 是文件
                    var isDir = stats.isDirectory()// 是文件夹
                    if (isFile) {
                      that.addFile(that.resolvePath(filedir))
                    }
                    if (isDir) {
                      // that.resolveDirectory(filedir) // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
                    }
                  }
                })
              }
            })
          }
        })
      },
      addFile (fileItem) {
        if (this.dataMap[fileItem.path]) {
          alert('重复添加：' + fileItem.path)
        } else {
          this.fileList.push(fileItem)
          this.dataMap[fileItem.path] = 1
        }
      },
      deleteItem (index) {
        let item = this.fileList[index]
        delete this.dataMap[item.path]
        this.fileList.splice(index, 1)
      },
      rightEvent (index) {
        // let item = this.fileList[index]
        // delete this.dataMap[item.path]
        // this.fileList.splice(index, 1)
        this.curFileIndex = index
        this.itemMenu.popup({window: remote.getCurrentWindow()})
      },
      rightBoxEvent () {
        this.fileBoxMenu.popup({window: remote.getCurrentWindow()})
      }
    },
    mounted: function () {
      let that = this
      // 右键餐单
      this.itemMenu = new remote.Menu()
      this.itemMenu.append(new remote.MenuItem({
        label: '删除',
        click: function (e) {
          if (that.curFileIndex === -1) return
          that.deleteItem(that.curFileIndex)
          that.curFileIndex = -1
        }
      }))
      this.fileBoxMenu = new remote.Menu()
      this.fileBoxMenu.append(new remote.MenuItem({
        label: '导入文件',
        click: function (e) {
          ipcRenderer.send('open-file-dialog')
        }
      }))
      this.$refs.dragFile.ondragleave = (e) => {
        e.preventDefault()
      }
      this.$refs.dragFile.ondrop = (e) => {
        e.preventDefault()
        const data = e.dataTransfer.files
        if (data.length < 1) {
          return
        };
        console.log('ok')
        for (let i = 0, len = e.dataTransfer.files.length; i < len; ++i) {
          let file = e.dataTransfer.files[i]
          let name = file.name
          // let type = e.dataTransfer.files[i].type
          if (name.indexOf('.xlsx') > -1 || name.indexOf('.xls') > -1) {
            this.addFile({name: name, path: file.path})
          }
        }
      }
      this.$refs.dragFile.ondragenter = (e) => {
        e.preventDefault() // 阻止拖入时的浏览器默认行为
        this.$refs.dragFile.border = '2px dashed red'
      }

      this.$refs.dragFile.ondragover = (e) => {
        e.preventDefault() // 阻止拖来拖去的浏览器默认行为
      }

      this.$refs.exportResult.onclick = () => {
        resolveExcel(this.fileList, this.dataMap)
        console.log(Object.keys(this.dataMap))
        const filePath = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
          filters: [
            { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
            { name: 'All Files', extensions: ['*'] } ]
        })
        if (filePath)exportExcel(this.dataMap, filePath)
      }

      ipcRenderer.on('open-file-dialog', (e, filePaths) => {
        for (let i = 0; i < filePaths.length; ++i) {
          this.fileList.push(this.resolvePath(filePaths[i]))
        }
      })

      ipcRenderer.on('open-directory-dialog', (e, directory) => {
        this.resolveDirectory(directory)
      })

      remote.app.on('window-all-closed', () => {
        fs.appendFileSync(path.join(that.baseUrl, 'history.log'), 'bbbb')
      })
    }
  }
</script>

<style >
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  #mainPage {
    width: 100%;
    min-height: 500px;
    overflow-y:auto;
  }
  #dragFile {
    width: 100%;
    min-height: 480px;
    height: calc(90vh);
    border: 1px #666565 dashed;
    text-align: center;
    line-height: calc(90vh);
  }
  .filebox{
    position: fixed;
    top:0px;
    width: 100%;
    margin-bottom: 10px;
  }
  .fileName{
    display: inline-block;
    width: 96%;
    padding-left: 10px;
  }
  .fileDelete{
    display: inline-block;
    width: 4%;
    cursor:pointer;
    color: #f50101;
  }
  a:hover {
    background-color: #c9c9c9;
  }
  .fileItem{
    border-bottom:1px #b3b3b3 solid;
  }
  #exportResult{
    color: #FFF;
    background-color: #47B347;
    cursor:pointer;
    width: 100px;
    text-align: center;
    padding: 5px;
    font-weight: bold;
    float: right;
    margin-top: 10px;
    margin-right: 10px;
    border-radius: 5px;
  }
</style>