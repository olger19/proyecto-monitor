/**
 * Calcula el Índice de Calidad de Red (ICR) de acuerdo al modelo ponderado de la tesis.
 * Fórmula: ICR = (W1 * Ev) + (W2 * E8)
 *
 * @param {number} download Vel. de descarga medida (Mbps)
 * @param {number} contracted Vel. contratada (Mbps)
 * @returns {number} ICR como valor decimal de 0.0 a 1.0
 */
export function calculateIcr(download, contracted) {
  const numericContracted = parseFloat(contracted) || 600
  const isOptimal = download >= numericContracted * 0.8

  const w1 = 0.5
  const w2 = 0.5
  const ev = Math.min(1.0, download / numericContracted)
  const e8 = isOptimal ? 1.0 : 0.0

  return w1 * ev + w2 * e8
}
