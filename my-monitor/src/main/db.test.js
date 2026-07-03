import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest'
import { existsSync, unlinkSync } from 'fs'

// Simular el módulo nativo de Electron antes de importar db.js
vi.mock('electron', () => {
  return {
    app: {
      getPath: () => '.' // Directorio de trabajo local para pruebas aisladas
    }
  }
})

// Importar los helpers de la base de datos
import { initDatabase, saveMeasurement, getRawMeasurements, getWeeklySummary } from './db'

describe('Pruebas Unitarias de Base de Datos y Consolidación de Historial', () => {
  beforeAll(() => {
    // Eliminar bases de datos de pruebas previas si existen
    if (existsSync('./database.sqlite')) {
      try {
        unlinkSync('./database.sqlite')
      } catch {
        // Ignorar
      }
    }
    if (existsSync('./database.json')) {
      try {
        unlinkSync('./database.json')
      } catch {
        // Ignorar
      }
    }

    // Inicializar base de datos de prueba silenciando el warning de versión nativa esperado en el test runner
    const originalError = console.error
    console.error = () => {}
    initDatabase()
    console.error = originalError
  })

  afterAll(() => {
    // Limpieza final de archivos de prueba creados
    if (existsSync('./database.sqlite')) {
      try {
        unlinkSync('./database.sqlite')
      } catch {
        // Ignorar
      }
    }
    if (existsSync('./database.json')) {
      try {
        unlinkSync('./database.json')
      } catch {
        // Ignorar
      }
    }
  })

  it('Debe inicializar la base de datos y tener datos demo sembrados si está vacía', () => {
    const raw = getRawMeasurements()
    expect(raw.length).toBeGreaterThan(0)

    // El sembrador mockData tiene exactamente 6 registros
    expect(raw.length).toBe(6)
  })

  it('Debe guardar y recuperar una nueva medición correctamente', () => {
    const initialCount = getRawMeasurements().length

    const mockTest = {
      download: 500.5,
      upload: 150.2,
      latency: 12.4,
      jitter: 1.8,
      contracted: '600 Mbps',
      status: 'ÓPTIMO',
      icr: 0.92
    }

    saveMeasurement(mockTest)

    const rawList = getRawMeasurements()
    expect(rawList.length).toBe(initialCount + 1)

    // La medición más reciente debe estar al inicio
    const latest = rawList[0]
    expect(latest.download).toBe(500.5)
    expect(latest.upload).toBe(150.2)
    expect(latest.latency).toBe(12.4)
    expect(latest.jitter).toBe(1.8)
    expect(latest.status).toBe('ÓPTIMO')
    expect(latest.icr).toBe(0.92)
  })

  it('Debe agrupar y calcular promedios diarios en el sumario semanal', () => {
    const summary = getWeeklySummary()
    expect(summary.length).toBeGreaterThan(0)

    // Cada registro consolidado debe contener los campos promedio correctos
    const firstDay = summary[0]
    expect(firstDay).toHaveProperty('date')
    expect(firstDay).toHaveProperty('avgDownload')
    expect(firstDay).toHaveProperty('avgUpload')
    expect(firstDay).toHaveProperty('avgLatency')
    expect(firstDay).toHaveProperty('avgJitter')
    expect(firstDay).toHaveProperty('icr')
    expect(firstDay).toHaveProperty('availability')

    // Verificar tipos numéricos correctos
    expect(typeof firstDay.avgDownload).toBe('number')
    expect(typeof firstDay.icr).toBe('number')
  })
})
