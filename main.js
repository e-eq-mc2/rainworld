// main.js

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = require('electron')
const path = require('path')
const Music = require('./music.js')

const appConfig = require('electron-settings');

function windowStateKeeper(windowName) {
  let window, windowState;
   function setBounds() {
    // Restore from appConfig
    if (appConfig.has(`windowState.${windowName}`)) {
      windowState = appConfig.get(`windowState.${windowName}`);
      return;
    }
    // Default
    windowState = {
      x: undefined,
      y: undefined,
      width: 1000,
      height: 800,
    };
  }
  function saveState() {
    if (!windowState.isMaximized) {
      windowState = window.getBounds();
    }
    windowState.isMaximized = window.isMaximized();
    appConfig.set(`windowState.${windowName}`, windowState);
  }
  function track(win) {
    window = win;
    ['resize', 'move', 'close'].forEach(event => {
      win.on(event, saveState);
    });
  }
  setBounds();
  return({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track,
  });
}


function createWindow () {
  // Get window state
  const mainWindowStateKeeper = windowStateKeeper('main');

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    useContentSize: true,
    //transparent: false,
    //show: true,
    frame: false,
    x: 0,
    y: 0, 
    //height: 1080,
    width: 2559,
    //resizable: true,
    //autoHideMenuBar: true,
    //'always-on-top': false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  //mainWindow.setFullScreen(true);
  //mainWindow.maximize();

  mainWindow.setResizable(true)
  //mainWindow.setWidth(2560)
  // Track window state
  //mainWindowStateKeeper.track(mainWindow);

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

  win.show()

  globalShortcut.register('Ctrl+Q', function() {　
    const windowState = win.getBounds();
    console.log(windowState)
    if (process.platform !== 'darwin') app.quit()
  })

  globalShortcut.register('Ctrl+B', function() {　
    win.setSize(3840, 1080)
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
