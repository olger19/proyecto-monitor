import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkEngine() {
  const downloadSpeed = ref(0)
  const uploadSpeed = ref(0)
  const latency = ref(12) // Mock latency
  const jitter = ref(2) // Mock jitter
  const status = ref('Listo')
  const contractedSpeed = ref('600 Mbps')

  // History peaks array
  const historicalPeaks = ref([
    { time: 'Hoy, 17:45:00', download: '598.1 Mbps', upload: '188.4 Mbps', status: 'ÓPTIMO' },
    { time: 'Hoy, 17:30:12', download: '582.0 Mbps', upload: '182.2 Mbps', status: 'ÓPTIMO' }
  ])

  // Chart data configuration
  const chartData = ref({
    labels: Array(30).fill(''),
    datasets: [
      {
        label: 'Bajada (Mbps)',
        data: Array(30).fill(0),
        borderColor: '#3b82f6', // Tailwind blue-500
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
        borderColor: '#64748b', // Tailwind slate-500
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

  // Start the speed test
  const startTest = () => {
    status.value = 'Iniciando motor...'
    if (window.electron) {
      window.electron.runTest()
    }
  }

  // Handle incoming data
  const handleData = (payload) => {
    if (!payload) return

    const type = String(payload.type)
    const phase = String(payload.phase)
    const value = Number(payload.data)

    if (type === 'progress' && phase === 'download') {
      status.value = 'Midiendo Descarga...'
      downloadSpeed.value = parseFloat(value.toFixed(1))

      // Simulate a proportional upload speed (~30% of download with minor noise)
      const mockUpload = parseFloat((value * 0.3 + (Math.random() * 6 - 3)).toFixed(1))
      uploadSpeed.value = Math.max(1, mockUpload)

      // Mock latency and jitter variation slightly to make the UI look alive
      latency.value = Math.max(4, Math.round(12 + Math.random() * 4 - 2))
      jitter.value = Math.max(1, Math.round(2 + Math.random() * 2 - 1))

      // Update Chart labels and datasets
      const newLabels = [...chartData.value.labels]
      newLabels.shift()
      newLabels.push(new Date().toLocaleTimeString())

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

      // Add to historical peaks (keep last 5 entries)
      const numericContracted = parseFloat(contractedSpeed.value) || 600
      const isOptimal = downloadSpeed.value >= numericContracted * 0.8

      const newPeak = {
        time: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        download: `${downloadSpeed.value} Mbps`,
        upload: `${uploadSpeed.value} Mbps`,
        status: isOptimal ? 'ÓPTIMO' : 'MODERADO'
      }

      historicalPeaks.value = [newPeak, ...historicalPeaks.value].slice(0, 5)
    } else if (type === 'done') {
      status.value = 'Listo'
    } else if (type === 'error') {
      status.value = `Error: ${payload.message || 'Fallo de ejecución'}`
    }
  }

  // Setup IPC listener
  let isMounted = false
  onMounted(() => {
    isMounted = true
    if (window.electron) {
      window.electron.onData((payload) => {
        if (isMounted) {
          handleData(payload)
        }
      })
      // Auto-trigger test on mount
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
    startTest
  }
}
