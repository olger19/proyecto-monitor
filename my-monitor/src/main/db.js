/**
 * @file db.js
 * @description Gestor de base de datos resiliente (SQLite / JSON Fallback)
 * @author Olger Antonio Jose Quispe Vilca
 * @university Universidad La Salle
 * @copyright Todos los derechos reservados (C) 2026
 */
import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import { existsSync, writeFileSync, readFileSync } from 'fs'

let db = null
let dbType = 'none'

const getSqlitePath = () => join(app.getPath('userData'), 'database.sqlite')
const getJsonPath = () => join(app.getPath('userData'), 'database.json')

// Inserta datos de prueba realistas (con ICR calculado) si la BD está vacía
function seedMockData() {
  const mockData = [
    {
      daysAgo: 1,
      download: 592.4,
      upload: 185.2,
      latency: 8.5,
      jitter: 1.2,
      status: 'ÓPTIMO',
      icr: 0.99
    },
    {
      daysAgo: 1,
      download: 581.1,
      upload: 180.5,
      latency: 9.1,
      jitter: 1.8,
      status: 'ÓPTIMO',
      icr: 0.98
    },
    {
      daysAgo: 2,
      download: 575.6,
      upload: 178.9,
      latency: 10.2,
      jitter: 2.1,
      status: 'ÓPTIMO',
      icr: 0.98
    },
    {
      daysAgo: 2,
      download: 412.3,
      upload: 120.4,
      latency: 25.4,
      jitter: 8.7,
      status: 'MODERADO',
      icr: 0.34
    }, // (0.5 * 412.3/600) + 0 = 0.34
    {
      daysAgo: 3,
      download: 595.0,
      upload: 191.0,
      latency: 7.9,
      jitter: 0.9,
      status: 'ÓPTIMO',
      icr: 1.0
    },
    {
      daysAgo: 4,
      download: 588.2,
      upload: 183.1,
      latency: 9.0,
      jitter: 1.5,
      status: 'ÓPTIMO',
      icr: 0.99
    }
  ]

  const now = new Date()

  if (dbType === 'sqlite' && db) {
    try {
      const insert = db.prepare(`
        INSERT INTO measurements (timestamp, download, upload, latency, jitter, contracted, status, icr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      mockData.forEach((item) => {
        const date = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000)
        insert.run(
          date.toISOString(),
          item.download,
          item.upload,
          item.latency,
          item.jitter,
          '600 Mbps',
          item.status,
          item.icr
        )
      })
      console.log('Datos demo sembrados con éxito en SQLite')
    } catch (err) {
      console.error('Error al sembrar datos demo en SQLite:', err)
    }
  } else {
    try {
      const list = []
      mockData.forEach((item, index) => {
        const date = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000)
        list.push({
          id: Date.now() - index,
          timestamp: date.toISOString(),
          download: item.download,
          upload: item.upload,
          latency: item.latency,
          jitter: item.jitter,
          contracted: '600 Mbps',
          status: item.status,
          icr: item.icr
        })
      })
      writeFileSync(getJsonPath(), JSON.stringify(list, null, 2), 'utf8')
      console.log('Datos demo sembrados con éxito en JSON de respaldo')
    } catch (err) {
      console.error('Error al sembrar datos demo en JSON:', err)
    }
  }
}

export function initDatabase() {
  try {
    const sqlitePath = getSqlitePath()
    db = new Database(sqlitePath)
    db.exec(`
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME,
        download REAL,
        upload REAL,
        latency REAL,
        jitter REAL,
        contracted TEXT,
        status TEXT,
        icr REAL
      )
    `)
    dbType = 'sqlite'
    console.log('Base de datos SQLite inicializada en:', sqlitePath)

    // Intento de migración automática por si el usuario ya tenía la tabla creada sin la columna 'icr'
    try {
      db.exec('ALTER TABLE measurements ADD COLUMN icr REAL')
      console.log('Migración SQLite: columna icr agregada con éxito')
    } catch {
      // La columna ya existe o la tabla se creó de cero
    }
  } catch (err) {
    console.error('No se pudo inicializar SQLite. Usando fallback de archivo JSON:', err)
    dbType = 'json'
    const jsonPath = getJsonPath()
    if (!existsSync(jsonPath)) {
      writeFileSync(jsonPath, JSON.stringify([], null, 2), 'utf8')
    }
  }

  // Si no hay ningún dato guardado en el historial, sembramos datos demo
  if (getRawMeasurements().length === 0) {
    seedMockData()
  }
}

export function saveMeasurement(data) {
  if (dbType === 'sqlite' && db) {
    try {
      const stmt = db.prepare(`
        INSERT INTO measurements (timestamp, download, upload, latency, jitter, contracted, status, icr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        new Date().toISOString(),
        data.download,
        data.upload,
        data.latency,
        data.jitter,
        data.contracted,
        data.status,
        data.icr
      )
      console.log('Medición guardada en SQLite con éxito')
    } catch (err) {
      console.error('Error al insertar medición en SQLite:', err)
    }
  } else {
    try {
      const list = getRawMeasurements()
      const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        download: data.download,
        upload: data.upload,
        latency: data.latency,
        jitter: data.jitter,
        contracted: data.contracted,
        status: data.status,
        icr: data.icr
      }
      list.unshift(record)
      writeFileSync(getJsonPath(), JSON.stringify(list, null, 2), 'utf8')
      console.log('Medición guardada en archivo JSON de respaldo')
    } catch (err) {
      console.error('Error al guardar en JSON:', err)
    }
  }
}

export function getRawMeasurements() {
  if (dbType === 'sqlite' && db) {
    try {
      return db.prepare('SELECT * FROM measurements ORDER BY timestamp DESC').all()
    } catch (err) {
      console.error('Error al leer mediciones de SQLite:', err)
      return []
    }
  } else {
    try {
      const jsonPath = getJsonPath()
      if (existsSync(jsonPath)) {
        return JSON.parse(readFileSync(jsonPath, 'utf8'))
      }
    } catch (err) {
      console.error('Error al leer de archivo JSON:', err)
    }
    return []
  }
}

// Group measurements by date and compute daily averages
export function getWeeklySummary() {
  if (dbType === 'sqlite' && db) {
    try {
      // Agrupar por fecha local aplicando el modificador 'localtime' al timestamp UTC
      const query = `
        SELECT 
          strftime('%Y-%m-%d', timestamp, 'localtime') as date,
          AVG(download) as avg_download,
          AVG(upload) as avg_upload,
          AVG(latency) as avg_latency,
          AVG(jitter) as avg_jitter,
          COUNT(*) as total_tests,
          SUM(CASE WHEN status = 'ÓPTIMO' THEN 1 ELSE 0 END) as optimal_tests,
          AVG(icr) as avg_icr
        FROM measurements
        GROUP BY date
        ORDER BY date DESC
        LIMIT 7
      `
      return db
        .prepare(query)
        .all()
        .map((row) => {
          // Fallback de ICR para registros viejos (se calcula a partir de disponibilidad)
          const rawIcr = row.avg_icr !== null ? row.avg_icr : row.optimal_tests / row.total_tests
          return {
            date: row.date,
            avgDownload: parseFloat(row.avg_download.toFixed(1)),
            avgUpload: parseFloat(row.avg_upload.toFixed(1)),
            avgLatency: parseFloat(row.avg_latency.toFixed(1)),
            avgJitter: parseFloat(row.avg_jitter.toFixed(1)),
            totalTests: row.total_tests,
            optimalTests: row.optimal_tests,
            availability: parseFloat(((row.optimal_tests / row.total_tests) * 100).toFixed(1)),
            icr: parseFloat((rawIcr * 100).toFixed(1))
          }
        })
    } catch (err) {
      console.error('Error al obtener sumario de SQLite:', err)
      return []
    }
  } else {
    // Agrupación en memoria usando la fecha local para el archivo JSON de respaldo
    try {
      const list = getRawMeasurements()
      const groups = {}
      list.forEach((item) => {
        const dateObj = new Date(item.timestamp)
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        if (!groups[dateStr]) {
          groups[dateStr] = []
        }
        groups[dateStr].push(item)
      })

      const summary = Object.keys(groups).map((date) => {
        const items = groups[date]
        const count = items.length
        const sumDownload = items.reduce((sum, item) => sum + item.download, 0)
        const sumUpload = items.reduce((sum, item) => sum + item.upload, 0)
        const sumLatency = items.reduce((sum, item) => sum + item.latency, 0)
        const sumJitter = items.reduce((sum, item) => sum + item.jitter, 0)
        const optimalCount = items.filter((item) => item.status === 'ÓPTIMO').length

        // Sumar icr con fallback si es indefinido en registros antiguos
        const sumIcr = items.reduce((sum, item) => {
          const val = item.icr !== undefined ? item.icr : item.status === 'ÓPTIMO' ? 1.0 : 0.0
          return sum + val
        }, 0)

        return {
          date,
          avgDownload: parseFloat((sumDownload / count).toFixed(1)),
          avgUpload: parseFloat((sumUpload / count).toFixed(1)),
          avgLatency: parseFloat((sumLatency / count).toFixed(1)),
          avgJitter: parseFloat((sumJitter / count).toFixed(1)),
          totalTests: count,
          optimalTests: optimalCount,
          availability: parseFloat(((optimalCount / count) * 100).toFixed(1)),
          icr: parseFloat(((sumIcr / count) * 100).toFixed(1))
        }
      })

      return summary.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
    } catch (err) {
      console.error('Error al obtener sumario de JSON:', err)
      return []
    }
  }
}
