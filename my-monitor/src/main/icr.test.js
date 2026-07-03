import { describe, it, expect } from 'vitest'
import { calculateIcr } from './icrHelper'

describe('Pruebas Unitarias de la Fórmula ICR (Índice de Calidad de Red)', () => {
  it('Caso Óptimo: Entrega 100% de la velocidad contratada', () => {
    // 600 Mbps medidos de 600 Mbps contratados
    // Ev = 1.0 (600 / 600)
    // E8 = 1.0 (600 >= 480)
    // ICR = (0.5 * 1.0) + (0.5 * 1.0) = 1.0 (100%)
    const icr = calculateIcr(600, 600)
    expect(icr).toBe(1.0)
  })

  it('Caso Umbral: Entrega 80% de la velocidad contratada', () => {
    // 480 Mbps medidos de 600 Mbps contratados (80%)
    // Ev = 0.8 (480 / 600)
    // E8 = 1.0 (480 >= 480)
    // ICR = (0.5 * 0.8) + (0.5 * 1.0) = 0.9 (90%)
    const icr = calculateIcr(480, 600)
    expect(icr).toBe(0.9)
  })

  it('Caso Sub-óptimo: Entrega 50% de la velocidad contratada (falla umbral)', () => {
    // 300 Mbps medidos de 600 Mbps contratados (50%)
    // Ev = 0.5 (300 / 600)
    // E8 = 0.0 (300 < 480)
    // ICR = (0.5 * 0.5) + (0.5 * 0.0) = 0.25 (25%)
    const icr = calculateIcr(300, 600)
    expect(icr).toBe(0.25)
  })

  it('Caso Límite: Cero velocidad de entrega', () => {
    // 0 Mbps medidos de 600 Mbps contratados
    // Ev = 0.0
    // E8 = 0.0
    // ICR = 0.0
    const icr = calculateIcr(0, 600)
    expect(icr).toBe(0.0)
  })

  it('Caso Límite: Velocidad medida superior a la contratada', () => {
    // 700 Mbps medidos de 600 Mbps contratados (se debe topear a 100% de calidad)
    // Ev = 1.0 (Math.min(1.0, 700/600))
    // E8 = 1.0 (700 >= 480)
    // ICR = 1.0
    const icr = calculateIcr(700, 600)
    expect(icr).toBe(1.0)
  })
})
