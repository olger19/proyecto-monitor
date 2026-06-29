import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkEngine() {
  const downloadSpeed = ref(0)
  const uploadSpeed = ref(0)
  const latency = ref(0)
  const jitter = ref(0)
  const status = ref('Listo')
  const contractedSpeed = ref('600 Mbps')

  // Historial de picos de pruebas completadas (cargados dinámicamente de BD)
  const historicalPeaks = ref([])

  // ICR de la prueba actual o más reciente
  const currentIcr = ref(100.0)

  // Configuración de la gráfica
  const chartData = ref({
    labels: Array(30).fill(''),
    datasets: [
      {
        label: 'Bajada (Mbps)',
        data: Array(30).fill(0),
        borderColor: '#3b82f6', // Azul de Tailwind
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4
      },
      {
        label: 'Subida (Mbps)',
        data: Array(30).fill(0),
        borderColor: '#64748b', // Slate de Tailwind
        backgroundColor: 'transparent',
        fill: false,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4
      }
    ]
  })

  // Cargar las últimas 5 mediciones desde la base de datos
  const loadRecentTests = async () => {
    if (window.electron && window.electron.getRecentTests) {
      try {
        const tests = await window.electron.getRecentTests()
        if (tests && tests.length > 0) {
          // Extraer ICR de la medición más reciente
          const latest = tests[0]
          const rawIcr =
            latest.icr !== undefined && latest.icr !== null
              ? latest.icr
              : latest.status === 'ÓPTIMO'
                ? 1.0
                : 0.0
          currentIcr.value = parseFloat((rawIcr * 100).toFixed(1))

          historicalPeaks.value = tests.map((test) => {
            let ts = test.timestamp
            if (ts && !ts.includes('T') && !ts.includes('Z')) {
              ts = ts.replace(' ', 'T') + 'Z'
            }
            const dateObj = new Date(ts)
            const formattedTime = dateObj.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
            const formattedDate = dateObj.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })
            return {
              time: `${formattedDate} ${formattedTime}`,
              download: `${parseFloat(Number(test.download).toFixed(1))} Mbps`,
              upload: `${parseFloat(Number(test.upload).toFixed(1))} Mbps`,
              status: test.status
            }
          })
        }
      } catch (err) {
        console.error('Error al cargar mediciones recientes:', err)
      }
    }
  }

  // Iniciar la prueba (ejecuta el binario de Go)
  const startTest = () => {
    status.value = 'Iniciando motor...'
    // Resetear velocidades actuales en interfaz
    downloadSpeed.value = 0
    uploadSpeed.value = 0
    if (window.electron) {
      window.electron.runTest(contractedSpeed.value)
    }
  }

  // Actualizar la gráfica con los resultados del ciclo de prueba
  const updateChart = () => {
    const newLabels = [...chartData.value.labels]
    newLabels.shift()
    newLabels.push(
      new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    )

    const newDownloadData = [...chartData.value.datasets[0].data]
    newDownloadData.shift()
    newDownloadData.push(downloadSpeed.value)

    const newUploadData = [...chartData.value.datasets[1].data]
    newUploadData.shift()
    newUploadData.push(uploadSpeed.value)

    chartData.value = {
      labels: newLabels,
      datasets: [
        {
          ...chartData.value.datasets[0],
          data: newDownloadData
        },
        {
          ...chartData.value.datasets[1],
          data: newUploadData
        }
      ]
    }
  }

  // Procesar los datos reales recibidos de Go
  const handleData = (payload) => {
    if (!payload) return

    const type = String(payload.type)
    const phase = String(payload.phase)

    if (type === 'progress') {
      if (phase === 'ping') {
        status.value = 'Midiendo Latencia...'
        if (payload.data) {
          latency.value = parseFloat(Number(payload.data.latency).toFixed(1))
          jitter.value = parseFloat(Number(payload.data.jitter).toFixed(1))
        }
      } else if (phase === 'download') {
        status.value = 'Midiendo Descarga...'
        downloadSpeed.value = parseFloat(Number(payload.data).toFixed(1))
      } else if (phase === 'upload') {
        status.value = 'Midiendo Subida...'
        uploadSpeed.value = parseFloat(Number(payload.data).toFixed(1))
      }
    } else if (type === 'done') {
      status.value = 'Listo'

      // 1. Agregar punto a la gráfica con la velocidad final consolidada
      updateChart()

      // 2. Recargar las mediciones recientes de la base de datos (guardado instantáneo)
      loadRecentTests()
    } else if (type === 'error') {
      status.value = `Error: ${payload.data || payload.message || 'Fallo del motor'}`
    }
  }

  let isMounted = false
  onMounted(() => {
    isMounted = true

    if (window.electron) {
      // Cargar mediciones persistentes al iniciar
      loadRecentTests()

      window.electron.onData((payload) => {
        if (isMounted) {
          handleData(payload)
        }
      })
      // Auto-iniciar prueba de velocidad al montar el componente
      startTest()
    }
  })

  onUnmounted(() => {
    isMounted = false
  })

  return {
    downloadSpeed,
    uploadSpeed,
    latency,
    jitter,
    status,
    contractedSpeed,
    historicalPeaks,
    chartData,
    currentIcr,
    startTest
  }
}
