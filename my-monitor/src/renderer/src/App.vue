<script setup>
import { ref, computed } from 'vue'
import { useNetworkEngine } from './composables/useNetworkEngine'
import NetworkChart from './components/NetworkChart.vue'
import WeeklyHistory from './components/WeeklyHistory.vue'

const currentTab = ref('speed')

const {
  downloadSpeed,
  uploadSpeed,
  latency,
  jitter,
  status,
  contractedSpeed,
  historicalPeaks,
  chartData,
  startTest
} = useNetworkEngine()

// Compute dynamic average speeds from data points in the chart
const avgDownload = computed(() => {
  const activeData = chartData.value.datasets[0].data.filter((v) => v > 0)
  if (activeData.length === 0) return downloadSpeed.value || 0
  const sum = activeData.reduce((a, b) => a + b, 0)
  return parseFloat((sum / activeData.length).toFixed(1))
})

const avgUpload = computed(() => {
  const activeData = chartData.value.datasets[1].data.filter((v) => v > 0)
  if (activeData.length === 0) return uploadSpeed.value || 0
  const sum = activeData.reduce((a, b) => a + b, 0)
  return parseFloat((sum / activeData.length).toFixed(1))
})
</script>

<template>
  <div class="text-on-surface bg-background min-h-screen font-body flex">
    <!-- SideNavBar Component -->
    <nav
      class="h-screen w-64 fixed left-0 top-0 bg-[#0f172a] border-r border-slate-800 flex flex-col p-6 space-y-8 text-sm font-medium z-50"
    >
      <!-- Brand Section -->
      <div class="flex items-center space-x-3 mb-2 shrink-0">
        <div
          class="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0"
        >
          <img
            alt="System Status"
            class="w-full h-full object-cover"
            src="./assets/brand_icon.png"
          />
        </div>
        <div>
          <h1 class="text-blue-400 font-headline font-bold text-base leading-tight">
            The Digital Curator
          </h1>
          <p class="text-on-surface-variant text-[10px] opacity-70">Network Intelligence</p>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="flex flex-col space-y-2 flex-grow">
        <a
          :class="[
            'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer',
            currentTab === 'speed'
              ? 'text-blue-400 font-bold bg-slate-800/50'
              : 'text-slate-400 hover:text-blue-400'
          ]"
          href="#"
          @click.prevent="currentTab = 'speed'"
        >
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1"
            >speed</span
          >
          <span>Análisis de Velocidad</span>
        </a>
        <a
          :class="[
            'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-not-allowed text-slate-500'
          ]"
          href="#"
        >
          <span class="material-symbols-outlined">edit_document</span>
          <span>Config. de Contrato</span>
        </a>
        <a
          :class="[
            'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer',
            currentTab === 'history'
              ? 'text-blue-400 font-bold bg-slate-800/50'
              : 'text-slate-400 hover:text-blue-400'
          ]"
          href="#"
          @click.prevent="currentTab = 'history'"
        >
          <span
            class="material-symbols-outlined"
            :style="currentTab === 'history' ? 'font-variation-settings: \'FILL\' 1' : ''"
            >history</span
          >
          <span>Historial Semanal</span>
        </a>

        <!-- Contract Input Field (Only visible when speed tab is active) -->
        <div v-if="currentTab === 'speed'" class="mt-8 px-4">
          <label
            class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 block"
            >Velocidad Contratada</label
          >
          <div class="relative">
            <input
              v-model="contractedSpeed"
              class="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 text-white"
              placeholder="Velocidad Contratada"
              type="text"
            />
          </div>
        </div>

        <!-- Start/Stop CTA (Only visible when speed tab is active) -->
        <div v-if="currentTab === 'speed'" class="mt-6 px-4">
          <button
            class="w-full py-4 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-blue-500/10 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 transition-colors flex items-center justify-center gap-2"
            :disabled="status.startsWith('Midiendo') || status.startsWith('Iniciando')"
            @click="startTest"
          >
            <span class="material-symbols-outlined text-sm">play_arrow</span>
            <span>{{ status === 'Listo' ? 'Iniciar Medición' : status }}</span>
          </button>
        </div>
      </div>

      <!-- Footer Tabs -->
      <div class="flex flex-col space-y-2 border-t border-slate-800 pt-6">
        <a
          class="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-blue-400 transition-all"
          href="#"
        >
          <span class="material-symbols-outlined">help_outline</span>
          <span>Soporte</span>
        </a>
        <a
          class="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-blue-400 transition-all"
          href="#"
        >
          <span class="material-symbols-outlined">list_alt</span>
          <span>Registros</span>
        </a>
      </div>
    </nav>

    <!-- Main Content Stage -->
    <main class="ml-64 flex-1 bg-surface min-h-screen">
      <!-- TopAppBar Component -->
      <header
        class="fixed top-0 right-0 left-64 h-16 px-8 z-40 flex justify-between items-center bg-[#0f172af2] backdrop-blur-xl border-b border-slate-800 transition-colors duration-300"
      >
        <div class="flex items-center gap-2">
          <span
            class="material-symbols-outlined text-primary"
            style="font-variation-settings: 'FILL' 1"
            >analytics</span
          >
          <span class="font-headline font-bold tracking-tighter text-white text-xl"
            >Curator Monitor</span
          >
        </div>
        <div class="flex items-center space-x-6">
          <div
            class="hidden lg:flex items-center bg-slate-800/50 rounded-full px-4 py-1.5 border border-slate-700/50"
          >
            <span class="material-symbols-outlined text-slate-500 text-sm">search</span>
            <input
              class="bg-transparent border-none focus:ring-0 text-xs w-48 text-slate-300"
              placeholder="Buscar análisis..."
              type="text"
            />
          </div>
          <div class="flex items-center gap-4">
            <button class="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
              <span class="material-symbols-outlined">notifications</span>
            </button>
            <button class="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
              <span class="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Speed Test View -->
      <div v-if="currentTab === 'speed'">
        <!-- Dashboard Content -->
        <div class="pt-24 pb-12 px-12 max-w-7xl mx-auto space-y-12">
          <!-- Hero Metric Header -->
          <section class="flex flex-col md:flex-row justify-between items-end gap-8">
            <div class="space-y-2">
              <span
                class="inline-block px-3 py-1 bg-blue-900/40 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest rounded-full"
              >
                {{ status.startsWith('Error') ? 'Problema Detectado' : 'Sistema Saludable' }}
              </span>
              <h2
                class="text-5xl font-headline font-extrabold text-white tracking-tight leading-tight"
              >
                Velocidad Actual: <span class="text-primary">{{ downloadSpeed }} Mbps</span>
              </h2>
              <p class="text-on-surface-variant font-body text-lg max-w-md">
                El rendimiento de tu red se encuentra actualmente dentro del rango de tu velocidad
                contratada de {{ contractedSpeed }}.
              </p>
            </div>
            <div class="flex gap-4">
              <div
                class="bg-slate-900/50 p-6 rounded-xl editorial-shadow min-w-[160px] border border-slate-800"
              >
                <p
                  class="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1"
                >
                  Latencia
                </p>
                <p class="text-3xl font-headline font-bold text-primary">{{ latency }}ms</p>
              </div>
              <div
                class="bg-slate-900/50 p-6 rounded-xl editorial-shadow min-w-[160px] border border-slate-800"
              >
                <p
                  class="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1"
                >
                  Inestabilidad
                </p>
                <p class="text-3xl font-headline font-bold text-slate-400">{{ jitter }}ms</p>
              </div>
            </div>
          </section>

          <!-- Real-time Chart Main Area -->
          <section class="grid grid-cols-1 gap-12">
            <div
              class="bg-slate-900/50 p-10 rounded-xl border border-slate-800 editorial-shadow space-y-8"
            >
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-headline font-bold text-white">Rendimiento de Red</h3>
                  <p class="text-sm text-on-surface-variant">
                    Velocidades de subida y bajada en tiempo real
                  </p>
                </div>
                <div class="flex items-center gap-6">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    ></span>
                    <span class="text-xs font-semibold text-on-surface-variant">Bajada (Mbps)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-slate-500"></span>
                    <span class="text-xs font-semibold text-on-surface-variant">Subida (Mbps)</span>
                  </div>
                </div>
              </div>

              <!-- Asymmetric Real-time Visualizer -->
              <div class="relative h-80 w-full">
                <NetworkChart :chart-data="chartData" class="w-full h-full" />
              </div>

              <!-- Chart Footer Averages -->
              <div class="flex justify-between pt-4 border-t border-slate-800 items-center">
                <div class="flex gap-12">
                  <div>
                    <span
                      class="block text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest"
                      >PROMEDIO BAJADA</span
                    >
                    <span class="text-2xl font-headline font-bold text-white"
                      >{{ avgDownload }} Mbps</span
                    >
                  </div>
                  <div>
                    <span
                      class="block text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest"
                      >PROMEDIO SUBIDA</span
                    >
                    <span class="text-2xl font-headline font-bold text-white"
                      >{{ avgUpload }} Mbps</span
                    >
                  </div>
                </div>
                <button
                  class="flex items-center gap-2 text-primary font-bold text-sm hover:text-blue-400"
                >
                  Ver Registros Detallados de Paquetes
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Bento Layout for Analytics Insights -->
          <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Data Insight 1 -->
            <div
              class="md:col-span-1 bg-slate-900/50 p-8 rounded-xl border border-slate-800 flex flex-col justify-between"
            >
              <div class="space-y-4">
                <div
                  class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-primary editorial-shadow ring-1 ring-slate-700"
                >
                  <span class="material-symbols-outlined">cloud_done</span>
                </div>
                <h4 class="text-lg font-headline font-bold leading-tight text-white">
                  Análisis de Proximidad del Servidor
                </h4>
                <p class="text-sm text-on-surface-variant">
                  Conectando vía Nodo de Prueba óptimo. La intensidad de la señal es óptima a
                  -42dBm.
                </p>
              </div>
              <div class="pt-6">
                <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary w-[92%] shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                  ></div>
                </div>
                <p class="text-[10px] mt-2 font-bold text-on-surface-variant">
                  CALIDAD DE SEÑAL: EXCELENTE
                </p>
              </div>
            </div>

            <!-- Data Insight 2 (Visual) -->
            <div
              class="md:col-span-2 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 editorial-shadow flex items-center"
            >
              <div class="p-8 space-y-4 flex-1">
                <h4 class="text-2xl font-headline font-extrabold tracking-tight text-white">
                  Puntaje de Estabilidad de Internet
                </h4>
                <p class="text-on-surface-variant font-body">
                  Hemos monitoreado tu conexión activamente. La consistencia promedio de bajada es
                  superior al 84% de los usuarios locales.
                </p>
                <div class="flex gap-2">
                  <span
                    class="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-xs font-bold"
                    >Confiable</span
                  >
                  <span
                    class="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-bold"
                    >Pocas Caídas</span
                  >
                </div>
              </div>
              <div class="w-1/3 h-full hidden lg:block relative min-h-[160px]">
                <img
                  alt="Futuristic digital infrastructure background"
                  class="absolute inset-0 h-full w-full object-cover grayscale opacity-10 hover:opacity-30 transition-all duration-700"
                  src="./assets/network_grid.png"
                />
              </div>
            </div>
          </section>

          <!-- Final Table-less List -->
          <section class="space-y-6">
            <div class="flex justify-between items-end px-2">
              <h4 class="text-2xl font-headline font-bold text-white">
                Picos Históricos (Últimos Tests)
              </h4>
              <p class="text-primary font-bold text-sm cursor-pointer hover:underline">
                Descargar Informe Completo
              </p>
            </div>
            <div
              class="bg-slate-900/50 rounded-xl border border-slate-800 editorial-shadow overflow-hidden"
            >
              <!-- Column headers -->
              <div
                class="flex px-8 py-4 bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800"
              >
                <div class="w-1/4">FECHA/HORA</div>
                <div class="w-1/4">BAJADA</div>
                <div class="w-1/4">SUBIDA</div>
                <div class="w-1/4">ESTADO</div>
              </div>

              <!-- Dynamic Rows -->
              <div
                v-for="(peak, idx) in historicalPeaks"
                :key="idx"
                :class="[
                  'flex px-8 py-8 items-center border-b border-slate-800/50 transition-colors hover:bg-slate-800/40',
                  idx % 2 === 1 ? 'bg-slate-800/20' : ''
                ]"
              >
                <div class="w-1/4 font-semibold text-white">{{ peak.time }}</div>
                <div class="w-1/4 text-blue-400 font-bold">{{ peak.download }}</div>
                <div class="w-1/4 text-slate-400">{{ peak.upload }}</div>
                <div class="w-1/4">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border',
                      peak.status === 'ÓPTIMO'
                        ? 'bg-blue-900/40 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-900/40 text-emerald-400 border-emerald-500/20'
                    ]"
                  >
                    {{ peak.status }}
                  </span>
                </div>
              </div>

              <!-- Fallback if empty -->
              <div
                v-if="historicalPeaks.length === 0"
                class="px-8 py-12 text-center text-slate-500"
              >
                No hay mediciones completadas en esta sesión. Presiona "Iniciar Medición" para
                comenzar.
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Weekly History View -->
      <div v-else-if="currentTab === 'history'">
        <WeeklyHistory />
      </div>
    </main>
  </div>
</template>

<style>
/* Remove standard button defaults for Tailwind */
button:focus {
  outline: none;
}
</style>
