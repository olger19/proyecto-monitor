/**
 * Calcula el promedio aritmético de las velocidades registradas omitiendo valores vacíos (cero).
 *
 * @param {number[]} dataPoints Colección de velocidades de la gráfica
 * @param {number} fallbackValue Valor a retornar si no hay muestras válidas
 * @returns {number} Promedio redondeado a 1 decimal
 */
export function calculateAverageSpeed(dataPoints, fallbackValue = 0) {
  const activeData = dataPoints.filter((v) => v > 0)
  if (activeData.length === 0) return parseFloat(Number(fallbackValue).toFixed(1))
  const sum = activeData.reduce((a, b) => a + b, 0)
  return parseFloat((sum / activeData.length).toFixed(1))
}
