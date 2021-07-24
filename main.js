// main.js

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')
const Music = require('./music.js')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    useContentSize: true,
    transparent: true,
    show: true,
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    //'always-on-top': true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.setFullScreen(true);

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  return mainWindow
}

const music = new Music()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const win = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  win.webContents.on('did-finish-load', () => {
    ipcMain.on('music', (event, data) => { 
      const song = `./music/${data}`
      music.run(song, (stdout) => {
       event.reply('music', stdout)
      })
    })

  })
})

app.on('before-quit', function (e) {
  music.kill()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
