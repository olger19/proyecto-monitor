import { spawn } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { initDatabase, saveMeasurement, getWeeklySummary, getRawMeasurements } from './db'

let activeEngine = null

// Inicializar la base de datos (SQLite con fallback JSON)
initDatabase()

function getEnginePath() {
  const devPath = join(__dirname, '../../resources/bin/engine.exe')
  const packagedPath = join(
    process.resourcesPath,
    'app.asar.unpacked',
    'resources',
    'bin',
    'engine.exe'
  )
  const legacyPackagedPath = join(process.resourcesPath, 'bin', 'engine.exe')
  if (!app.isPackaged) return devPath
  if (existsSync(packagedPath)) return packagedPath
  if (existsSync(legacyPackagedPath)) return legacyPackagedPath
  return packagedPath
}

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

  // Cargamos la aplicación (Vite en desarrollo, archivo en producción)
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Comentar o eliminar esta línea para que no se abra la consola de DevTools automáticamente:
  // mainWindow.webContents.openDevTools()

  // Handler para iniciar pruebas de velocidad y almacenar resultados
  ipcMain.on('run-test', (event, contractedSpeedVal) => {
    const currentContracted = contractedSpeedVal || '600 Mbps'
    let lastDownload = 0
    let lastUpload = 0
    let lastLatency = 0
    let lastJitter = 0

    if (activeEngine) {
      console.log('Deteniendo instancia previa del motor Go...')
      try {
        activeEngine.kill()
      } catch (err) {
        console.error('Error al detener motor Go:', err)
      }
      activeEngine = null
    }

    const enginePath = getEnginePath()
    console.log('Ejecutando engine desde:', enginePath)

    try {
      activeEngine = spawn(enginePath)
    } catch (err) {
      console.error('Error crítico al hacer spawn del motor:', err)
      mainWindow.webContents.send('engine-data', {
        type: 'error',
        phase: 'engine-spawn',
        message: err.message
      })
      return
    }

    activeEngine.stdout.on('data', (data) => {
      const chunks = data.toString().split('\n')
      chunks.forEach((chunk) => {
        const trimmedChunk = chunk.trim()
        if (trimmedChunk) {
          console.log('RADAR MAIN - Dato crudo de Go:', trimmedChunk)
          try {
            const payload = JSON.parse(trimmedChunk)

            // Acumular métricas para la base de datos
            if (payload.type === 'progress') {
              if (payload.phase === 'ping' && payload.data) {
                lastLatency = payload.data.latency || 0
                lastJitter = payload.data.jitter || 0
              } else if (payload.phase === 'download') {
                lastDownload = payload.data || 0
              } else if (payload.phase === 'upload') {
                lastUpload = payload.data || 0
              }
            }

            mainWindow.webContents.send('engine-data', payload)
          } catch (e) {
            console.log('No es JSON:', trimmedChunk)
            console.log(e)
          }
        }
      })
    })

    activeEngine.on('close', () => {
      // Guardar el registro en la base de datos al finalizar con éxito el ciclo de pruebas
      if (lastDownload > 0) {
        const numericContracted = parseFloat(currentContracted) || 600
        const isOptimal = lastDownload >= numericContracted * 0.8
        const status = isOptimal ? 'ÓPTIMO' : 'MODERADO'

        // Calcular ICR = (W1 * Ev) + (W2 * E8)
        const w1 = 0.5
        const w2 = 0.5
        const ev = Math.min(1.0, lastDownload / numericContracted)
        const e8 = isOptimal ? 1.0 : 0.0
        const icrVal = w1 * ev + w2 * e8

        saveMeasurement({
          download: lastDownload,
          upload: lastUpload,
          latency: lastLatency,
          jitter: lastJitter,
          contracted: currentContracted,
          status: status,
          icr: icrVal
        })
      }

      mainWindow.webContents.send('engine-data', { type: 'done', phase: 'finished' })
      activeEngine = null
    })

    activeEngine.on('error', (err) => {
      console.error('Error al iniciar el motor de Go:', err)
      mainWindow.webContents.send('engine-data', {
        type: 'error',
        phase: 'engine-start',
        message: err.message
      })
      activeEngine = null
    })
  })

  // Handler para consultar el resumen semanal de la base de datos
  ipcMain.handle('get-weekly-summary', () => {
    return getWeeklySummary()
  })

  // Handler para consultar las últimas 5 mediciones individuales registradas
  ipcMain.handle('get-recent-tests', () => {
    return getRawMeasurements().slice(0, 5)
  })

  // Handler para generar el PDF descargable explicativo para no técnicos
  ipcMain.handle('download-pdf-report', async () => {
    const summary = getWeeklySummary()
    if (summary.length === 0) {
      return {
        success: false,
        error: 'No hay suficientes datos registrados para generar el reporte.'
      }
    }

    const totalDays = summary.length
    const avgDownload = parseFloat(
      (summary.reduce((s, r) => s + r.avgDownload, 0) / totalDays).toFixed(1)
    )
    const avgUpload = parseFloat(
      (summary.reduce((s, r) => s + r.avgUpload, 0) / totalDays).toFixed(1)
    )
    const avgLatency = parseFloat(
      (summary.reduce((s, r) => s + r.avgLatency, 0) / totalDays).toFixed(1)
    )
    const avgJitter = parseFloat(
      (summary.reduce((s, r) => s + r.avgJitter, 0) / totalDays).toFixed(1)
    )
    const avgIcr = parseFloat((summary.reduce((s, r) => s + r.icr, 0) / totalDays).toFixed(1))

    let healthStatus = 'Óptimo'
    let healthColor = '#10b981'
    let healthBg = '#ecfdf5'
    let healthMessage = 'Tu internet estuvo estable y disponible la mayor parte de la semana.'

    if (avgIcr < 90) {
      healthStatus = 'Inestable'
      healthColor = '#ef4444'
      healthBg = '#fef2f2'
      healthMessage = 'Se detectaron caídas o velocidad reducida frecuente durante la semana.'
    } else if (avgIcr < 95) {
      healthStatus = 'Aceptable'
      healthColor = '#f59e0b'
      healthBg = '#fffbeb'
      healthMessage = 'La conexión es funcional, pero ha experimentado fluctuaciones de velocidad.'
    }

    // Diseñar plantilla HTML interactiva con descripciones amigables
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Reporte de Conectividad Semanal</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          background: #ffffff;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: bold;
          color: #0f172a;
          margin: 0;
        }
        .brand-sub {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .report-date {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }
        .report-title {
          font-size: 26px;
          font-weight: 800;
          color: #005db5;
          margin-bottom: 25px;
          text-align: center;
        }
        .health-card {
          background-color: ${healthBg};
          border-left: 5px solid ${healthColor};
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .health-title {
          font-size: 18px;
          font-weight: bold;
          color: ${healthColor};
          margin: 0 0 5px 0;
        }
        .health-text {
          font-size: 14px;
          margin: 0;
          color: #334155;
        }
        .grid {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 15px;
        }
        .metric-box {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        .metric-label {
          font-size: 10px;
          font-weight: bold;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #0f172a;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .concept-list {
          margin-bottom: 30px;
        }
        .concept-item {
          margin-bottom: 15px;
        }
        .concept-name {
          font-weight: bold;
          font-size: 14px;
          color: #0f172a;
        }
        .concept-desc {
          font-size: 13px;
          color: #475569;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 13px;
        }
        th {
          background-color: #f1f5f9;
          color: #475569;
          text-align: left;
          padding: 10px;
          font-weight: bold;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 12px 10px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        .status-optimo {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-moderado {
          background-color: #fef3c7;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-title">The Digital Curator</div>
          <div class="brand-sub">Network Intelligence</div>
        </div>
        <div class="report-date">
          Generado el: ${new Date().toLocaleDateString('es-ES')}<br>
          Periodo: Últimos 7 días
        </div>
      </div>

      <div class="report-title">Reporte Semanal de Rendimiento de Internet</div>

      <div class="health-card">
        <div class="health-title">Estado del Sistema: ${healthStatus} (${avgIcr}% de Disponibilidad Verificada - ICR)</div>
        <p class="health-text">${healthMessage} Tu velocidad promedio de descarga registrada fue de ${avgDownload} Mbps.</p>
      </div>

      <div class="section-title">Resumen de Métricas Promedio</div>
      <div class="grid">
        <div class="metric-box">
          <div class="metric-label">Descarga Promedio</div>
          <div class="metric-value">${avgDownload} Mbps</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Subida Promedio</div>
          <div class="metric-value">${avgUpload} Mbps</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Latencia (Ping)</div>
          <div class="metric-value">${avgLatency} ms</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Inestabilidad (Jitter)</div>
          <div class="metric-value">${avgJitter} ms</div>
        </div>
      </div>

      <div class="section-title">¿Cómo entender este reporte? (Guía sencilla)</div>
      <div class="concept-list">
        <div class="concept-item">
          <div class="concept-name">1. Velocidad de Descarga (Download)</div>
          <div class="concept-desc">Representa la velocidad con la que abres páginas web, juegas o reproduces películas y música. A mayor velocidad, menor será la espera.</div>
        </div>
        <div class="concept-item">
          <div class="concept-name">2. Velocidad de Subida (Upload)</div>
          <div class="concept-desc">Es la rapidez con la que envías información. Es fundamental para que los demás te escuchen y vean bien en videollamadas de Zoom o Teams y para subir tareas a la nube.</div>
        </div>
        <div class="concept-item">
          <div class="concept-name">3. Latencia y Jitter (Ping)</div>
          <div class="concept-desc">Es el retraso en la señal. Si tu latencia es baja (menor a 20ms), las conversaciones en tus llamadas fluyen sin retraso. Un Jitter alto indica que la conexión fluctúa y la videollamada puede cortarse.</div>
        </div>
        <div class="concept-item">
          <div class="concept-name">4. Disponibilidad Verificada (ICR)</div>
          <div class="concept-desc">El Índice de Calidad de Red (ICR) es un indicador de tesis que mide el cumplimiento del contrato mediante la fórmula: <code>ICR = (0.5 * Ev) + (0.5 * E8)</code>, donde Ev es el porcentaje de velocidad real alcanzado respecto al contrato y E8 es un premio del 50% por superar el umbral regulatorio del 80%.</div>
        </div>
      </div>

      <div class="section-title">Historial de Desempeño Diario</div>
      <table>
        <thead>
          <tr>
             <th>Fecha</th>
             <th>Prom. Descarga</th>
             <th>Prom. Subida</th>
             <th>Latencia Prom.</th>
             <th>Calidad de Red (ICR)</th>
             <th>Calidad de Señal</th>
          </tr>
        </thead>
        <tbody>
          ${summary
            .map((day) => {
              const [year, month, dateDay] = day.date.split('-')
              const dateObj = new Date(year, month - 1, dateDay)
              const formattedDay = dateObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
              })
              const capitalizedDay = formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1)
              const isOptimal = day.availability >= 80

              return `
              <tr>
                <td><strong>${capitalizedDay}</strong></td>
                <td>${day.avgDownload} Mbps</td>
                <td>${day.avgUpload} Mbps</td>
                <td>${day.avgLatency} ms</td>
                <td>${day.icr}%</td>
                <td>
                  <span class="status-badge ${isOptimal ? 'status-optimo' : 'status-moderado'}">
                    ${isOptimal ? 'ÓPTIMO' : 'MODERADO'}
                  </span>
                </td>
              </tr>
            `
            })
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
    `

    const pdfWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false
      }
    })

    await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent))

    try {
      const pdfData = await pdfWin.webContents.printToPDF({
        printBackground: true,
        margins: {
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5
        }
      })

      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar Reporte Semanal',
        defaultPath: join(app.getPath('downloads'), `reporte-semanal-conectividad.pdf`),
        filters: [{ name: 'Documento PDF', extensions: ['pdf'] }]
      })

      if (!canceled && filePath) {
        writeFileSync(filePath, pdfData)
        pdfWin.destroy()
        return { success: true, path: filePath }
      }
    } catch (err) {
      console.error('Error al generar el PDF del reporte:', err)
      pdfWin.destroy()
      return { success: false, error: err.message }
    }

    pdfWin.destroy()
    return { success: false, error: 'Operación cancelada' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (activeEngine) {
    activeEngine.kill()
    activeEngine = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  if (activeEngine) {
    activeEngine.kill()
    activeEngine = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
