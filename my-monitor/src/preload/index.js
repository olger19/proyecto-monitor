import { contextBridge, ipcRenderer } from 'electron'

try {
  contextBridge.exposeInMainWorld('electron', {
    runTest: (contracted) => ipcRenderer.send('run-test', contracted),
    getWeeklySummary: () => ipcRenderer.invoke('get-weekly-summary'),
    downloadPdfReport: () => ipcRenderer.invoke('download-pdf-report'),
    getRecentTests: () => ipcRenderer.invoke('get-recent-tests'),
    uploadSignature: () => ipcRenderer.invoke('upload-signature'),
    getSignature: () => ipcRenderer.invoke('get-signature'),
    onData: (callback) => {
      // Eliminamos todos los escuchadores previos para evitar duplicidad
      ipcRenderer.removeAllListeners('engine-data')
      // Escuchamos el evento de forma atómica
      ipcRenderer.on('engine-data', (_event, value) => {
        // Usamos setTimeout 0 para sacar la ejecución del callback de la pila actual
        setTimeout(() => callback(value), 0)
      })
    }
  })
  console.log('¡Preload configurado!')
} catch (error) {
  console.error('Error crítico en preload:', error)
}
