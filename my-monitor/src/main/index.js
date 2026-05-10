import { spawn } from 'child_process'
import { join } from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'

function createWindow() {
  const preloadPath = join(__dirname, '../preload/index.js')
  console.log('Buscando preload en:', preloadPath)

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 1. AHORA SÍ: Cargamos la aplicación (Vite en desarrollo, archivo en producción)
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.openDevTools()

  ipcMain.on('run-test', () => {
    const isDev = !app.isPackaged
    const enginePath = isDev
      ? join(__dirname, '../../resources/bin/engine.exe')
      : join(process.resourcesPath, 'bin/engine.exe')

    const engine = spawn(enginePath)

    // Dentro de ipcMain.on('run-test', ...)
    engine.stdout.on('data', (data) => {
      // Convertimos el buffer a string y lo separamos por saltos de línea
      const chunks = data.toString().split('\n')

      chunks.forEach((chunk) => {
        const trimmedChunk = chunk.trim()
        if (trimmedChunk) {
          console.log('RADAR MAIN - Dato crudo de Go:', trimmedChunk)
          try {
            const payload = JSON.parse(trimmedChunk)
            // Enviamos al renderer
            mainWindow.webContents.send('engine-data', payload)
          } catch (e) {
            // Si no es un JSON válido (ej: un log de Go), lo ignoramos o lo logueamos
            console.log('No es JSON:', trimmedChunk)
            console.log('Mensaje no-JSON del motor:', trimmedChunk)
            console.log(e)
          }
        }
      })
    })

    engine.on('close', () => {
      // Usamos el mismo canal para el fin del test
      mainWindow.webContents.send('engine-data', { type: 'done', phase: 'finished' })
    })

    // Si el proceso de Go falla al iniciar
    engine.on('error', (err) => {
      console.error('Error al iniciar el motor de Go:', err)
    })
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
