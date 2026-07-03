import { describe, it, expect } from 'vitest'
import { calculateAverageSpeed } from './chartHelper'

describe('Pruebas Unitarias de Promedio de Datos de la Gráfica', () => {
  it('Debe calcular el promedio correcto omitiendo valores inicializados en cero', () => {
    // Escenario: La gráfica tiene puntos iniciales en cero y tres velocidades reales registradas
    const mockData = [0, 0, 0, 100.5, 0, 200.0, 150.5, 0]

    // Promedio esperado de [100.5, 200.0, 150.5] = 451.0 / 3 = 150.333... -> 150.3
    const average = calculateAverageSpeed(mockData, 0)
    expect(average).toBe(150.3)
  })

  it('Debe devolver el valor de respaldo (fallback) si no hay muestras reales mayores a cero', () => {
    // Escenario: La gráfica se acaba de iniciar y está llena de ceros
    const mockData = Array(30).fill(0)

    const average = calculateAverageSpeed(mockData, 95.5)
    expect(average).toBe(95.5)
  })

  it('Debe redondear el promedio a un decimal exacto', () => {
    // [80.34, 90.56] -> promedio 85.45 -> redondeado a 85.5
    const mockData = [80.34, 90.56]
    const average = calculateAverageSpeed(mockData, 0)
    expect(average).toBe(85.5)
  })
})
