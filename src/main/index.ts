import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { checkBuildDownloaded, downloadBuild, launch } from './mclc'
import { Auth } from 'msmc'
import { IUser } from 'minecraft-launcher-core'

var mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('checkBuildDownloaded', async (_, version) => {
    try {
      const isDownloaded = await checkBuildDownloaded(version)
      return isDownloaded
    } catch (error) {
      console.error('Error checking build download status:', error)
      return false
    }
  })

  ipcMain.handle('download', async (_, version) => {
    try {
      await downloadBuild(version)
      return { success: true }
    } catch (error) {
      console.error('Download failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('addAccount', async () => {
    const authManager = new Auth('select_account')
    try {
      const result = await authManager.launch('electron')
      const minecraft = await result.getMinecraft()
      return minecraft.mclc() as IUser
    } catch (error) {
      console.error('Failed to add account:', error)
      return null
    }
  })

  ipcMain.handle('getAccounts', () => {
    return []
  })

  ipcMain.handle('launch', async (_, version, token) => {
    try {
      await launch(version, token, mainWindow)
      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Launch failed:', error)
        return { success: false, error: error.message }
      } else {
        console.error('Launch failed:', error)
        return { success: false, error: 'Unknown error' }
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
