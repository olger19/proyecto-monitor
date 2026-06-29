<template>
  <div class="pt-28 px-12 pb-24 max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12 flex justify-between items-end">
      <div>
        <h1 class="font-headline text-4xl font-extrabold text-slate-100 mb-2 tracking-tight">
          Historial Semanal
        </h1>
        <p class="text-slate-400 font-body text-base">
          Reportes de rendimiento curados de la semana actual.
        </p>
      </div>
      <button
        :disabled="loading || historyList.length === 0"
        class="bg-primary text-white px-5 py-3 rounded-xl font-body font-bold text-sm hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 transition-colors flex items-center space-x-2 shadow-lg shadow-blue-500/10 cursor-pointer"
        @click="downloadWeeklyPDF"
      >
        <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
        <span>{{ pdfLoading ? 'Generando PDF...' : 'Reporte Semanal Completo' }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center text-slate-400">
      <span class="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
      <p class="text-sm">Cargando historial de mediciones...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="historyList.length === 0"
      class="py-16 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 p-8"
    >
      <span class="material-symbols-outlined text-slate-500 text-5xl mb-4">folder_open</span>
      <h3 class="text-lg font-bold text-white mb-2">No hay datos de medición registrados</h3>
      <p class="text-slate-400 text-sm max-w-md mx-auto">
        Comienza a realizar pruebas de velocidad en la pestaña "Análisis de Velocidad" para que se
        registren promedios diarios en tu historial semanal de base de datos.
      </p>
    </div>

    <!-- List Container -->
    <div v-else class="space-y-6">
      <div
        v-for="item in historyList"
        :key="item.date"
        class="dark:bg-slate-900 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between transition-all hover:bg-surface-container-low dark:hover:bg-slate-800 border border-slate-800/40"
      >
        <div class="flex items-center space-x-6">
          <div
            class="w-12 h-12 rounded-full dark:bg-blue-900/40 bg-primary-container flex items-center justify-center text-on-primary-container dark:text-blue-200 shrink-0"
          >
            <span class="material-symbols-outlined">description</span>
          </div>
          <div>
            <p class="font-body text-sm font-semibold dark:text-slate-100 text-on-surface mb-1">
              {{ formatDate(item.date) }}
            </p>
            <div class="flex items-center space-x-3 flex-wrap gap-y-2">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full dark:bg-blue-900/20 bg-blue-100 text-blue-400 dark:text-blue-200 text-xs font-medium border border-blue-500/20 font-semibold"
              >
                ICR: {{ item.icr }}%
              </span>
              <span class="text-slate-400 text-xs font-body">
                Descarga: {{ item.avgDownload }} Mbps | Subida: {{ item.avgUpload }} Mbps |
                Latencia: {{ item.avgLatency }} ms
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ml-2',
                  item.availability >= 80
                    ? 'bg-blue-900/40 text-blue-400 border-blue-500/20'
                    : 'bg-amber-900/40 text-amber-400 border-amber-500/20'
                ]"
              >
                {{ item.availability >= 80 ? 'Óptimo' : 'Moderado' }}
              </span>
            </div>
          </div>
        </div>
        <button
          class="bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-body font-semibold text-xs hover:bg-slate-700 transition-colors flex items-center space-x-1.5 border border-slate-700/50 cursor-pointer"
          @click="downloadWeeklyPDF"
        >
          <span class="material-symbols-outlined text-xs">download</span>
          <span>PDF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const pdfLoading = ref(false)
const historyList = ref([])

// Consultar historial semanal dinámico por medio del puente IPC
const loadHistory = async () => {
  if (window.electron && window.electron.getWeeklySummary) {
    try {
      loading.value = true
      historyList.value = await window.electron.getWeeklySummary()
    } catch (err) {
      console.error('Error al consultar historial semanal:', err)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
}

// Invocar la creación y descarga del reporte PDF en el proceso Main
const downloadWeeklyPDF = async () => {
  if (window.electron && window.electron.downloadPdfReport) {
    try {
      pdfLoading.value = true
      const res = await window.electron.downloadPdfReport()
      if (res.success) {
        alert(`Reporte PDF generado exitosamente en:\n${res.path}`)
      } else if (res.error && res.error !== 'Operación cancelada') {
        alert(`Error al generar reporte: ${res.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error crítico al procesar la descarga del PDF.')
    } finally {
      pdfLoading.value = false
    }
  }
}

// Formatear fechas YYYY-MM-DD a formato humanizado largo
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const dateObj = new Date(year, month - 1, day)
  const formatted = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

onMounted(() => {
  loadHistory()
})
</script>
