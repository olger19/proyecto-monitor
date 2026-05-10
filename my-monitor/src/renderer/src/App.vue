<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import NetworkChart from './components/NetworkChart.vue'

const state = reactive({
  downloadData: {
    labels: Array(30).fill(''),
    datasets: [
      {
        label: 'Descarga Mbps',
        data: Array(30).fill(0),
        borderColor: '#3b82f6',
        fill: true
      }
    ]
  },
  currentPing: 0,
  status: 'Listo'
})

const startTest = () => {
  state.status = 'Iniciando...'
  window.electron.runTest()
}

let cleanup = null // Para guardar la función de limpieza
onMounted(() => {
  if (window.electron) {
    window.electron.onData((payload) => {
      // 1. Validar que el objeto existe
      if (!payload) return

      // 2. Extraer solo los valores primitivos (esto rompe recursiones)
      const type = String(payload.type)
      const phase = String(payload.phase)
      const valor = Number(payload.data)

      if (type === 'progress' && phase === 'download') {
        state.status = 'Midiendo Descarga...'

        // 1. Preparamos los nuevos arrays
        const newLabels = [...state.downloadData.labels]
        newLabels.shift()
        newLabels.push(new Date().toLocaleTimeString())

        const newData = [...state.downloadData.datasets[0].data]
        newData.shift()
        newData.push(valor)

        // 2. LA MAGIA: Reemplazamos TODO el objeto 'downloadData'
        // Esto obliga a vue-chartjs a redibujar la gráfica instantáneamente
        state.downloadData = {
          labels: newLabels,
          datasets: [
            {
              ...state.downloadData.datasets[0], // Mantenemos los colores y estilos
              data: newData // Inyectamos la nueva data
            }
          ]
        }
      }
    })
    window.electron.runTest()
  }
})

// Importante: Limpiar al destruir el componente
onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<template>
  <div>
    <h1>Speedtest Desktop</h1>
    <p>Estado: {{ state.status }} | Ping: {{ state.currentPing }}ms</p>
    <button @click="startTest">Iniciar Test</button>
    <div style="height: 400px">
      <NetworkChart :chart-data="state.downloadData" />
    </div>
  </div>
</template>
