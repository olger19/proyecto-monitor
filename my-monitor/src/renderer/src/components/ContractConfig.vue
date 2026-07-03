<template>
  <main class="pt-24 pb-16 px-12 max-w-6xl mx-auto flex flex-col min-h-screen">
    <header class="mb-12">
      <h1 class="text-4xl font-headline font-extrabold text-slate-100 tracking-tight mb-2">
        Configuración de Contrato
      </h1>
      <p class="text-slate-400 font-body text-base max-w-2xl">
        Gestione los parámetros fundamentales de su servicio de red. Estos valores definen las
        líneas base para los análisis de rendimiento en su dashboard principal.
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Config Column -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Speed Config Card (Elevated Focus) -->
        <section
          class="bg-slate-850 dark:bg-slate-800 rounded-[0.75rem] p-8 shadow-lg border border-slate-700 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
        >
          <!-- Subtle brand wash gradient -->
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-900/20 to-transparent rounded-bl-full -z-10 pointer-events-none"
          ></div>
          <div
            class="flex-shrink-0 bg-blue-900/50 text-blue-300 h-16 w-16 rounded-full flex items-center justify-center border border-blue-800"
          >
            <span
              class="material-symbols-outlined text-3xl"
              style="font-variation-settings: 'FILL' 1"
              >speed</span
            >
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-headline font-bold text-slate-100 mb-1">
              Velocidad Contratada
            </h3>
            <p class="text-slate-400 font-body text-sm mb-6 leading-relaxed">
              Este es el límite máximo de ancho de banda garantizado por su proveedor. Establecer
              este valor correctamente permite que The Digital Curator mida con precisión el
              porcentaje de entrega real vs. el prometido en sus reportes de rendimiento.
            </p>
            <div
              class="bg-slate-900/50 px-6 py-5 rounded-[0.75rem] border border-slate-700 flex items-center justify-between"
            >
              <div class="flex items-baseline space-x-2">
                <span class="text-4xl font-headline font-extrabold text-blue-400 tracking-tighter"
                  >600</span
                >
                <span class="text-slate-400 font-body font-medium">Mbps</span>
              </div>
              <button
                class="text-blue-400 font-body text-sm font-semibold hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-blue-500/25"
              >
                Editar Límite
              </button>
            </div>
          </div>
        </section>

        <!-- Signature Config Card (Elevated Focus) -->
        <section
          class="bg-slate-850 dark:bg-slate-800 rounded-[0.75rem] p-8 shadow-lg border border-slate-700 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
        >
          <div
            class="flex-shrink-0 bg-blue-900/50 text-blue-300 h-16 w-16 rounded-full flex items-center justify-center border border-blue-800"
          >
            <span
              class="material-symbols-outlined text-3xl"
              style="font-variation-settings: 'FILL' 1"
              >edit_document</span
            >
          </div>
          <div class="flex-1 w-full">
            <h3 class="text-xl font-headline font-bold text-slate-100 mb-1">
              Firma Digitalizada del Director
            </h3>
            <p class="text-slate-400 font-body text-sm mb-6 leading-relaxed">
              Suba una fotografía o firma escaneada (.png, .jpg o .jpeg) del director de la
              institución. Esta firma se estampará automáticamente en el reporte de rendimiento
              semanal exportado en PDF.
            </p>

            <div
              class="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/50 p-6 rounded-[0.75rem] border border-slate-700"
            >
              <!-- Preview Area -->
              <div
                class="w-full sm:w-48 h-24 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden p-2 shrink-0"
              >
                <img
                  v-if="signatureBase64"
                  :src="signatureBase64"
                  alt="Firma del Director"
                  class="max-w-full max-h-full object-contain filter brightness-110"
                />
                <div v-else class="text-center text-slate-500 text-xs flex flex-col items-center">
                  <svg
                    width="80"
                    height="35"
                    viewBox="0 0 120 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="opacity-30 mb-1"
                  >
                    <path
                      d="M12 28C22 13 32 40 45 23C58 6 62 42 80 18C98 -2 102 46 112 25"
                      stroke="#94a3b8"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M35 15C48 10 70 8 85 14"
                      stroke="#94a3b8"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span>Firma por Defecto (SVG)</span>
                </div>
              </div>

              <!-- Button CTA -->
              <div class="flex-grow space-y-3 w-full sm:w-auto">
                <button
                  class="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-body text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-blue-500/25"
                  @click="handleUploadSignature"
                >
                  <span class="material-symbols-outlined text-sm">cloud_upload</span>
                  <span>Cargar Imagen de Firma</span>
                </button>
                <p class="text-[10px] text-slate-400 leading-normal">
                  Soporta formatos PNG, JPG y JPEG. Se recomienda fondo transparente para una
                  impresión óptima en el reporte de validez institucional.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Side Information Column -->
      <div class="space-y-6">
        <!-- Provider Details -->
        <section class="bg-slate-800/50 rounded-[0.75rem] p-6 border border-slate-700">
          <h3 class="text-sm font-headline font-bold text-slate-400 uppercase tracking-wider mb-4">
            Detalles del Proveedor
          </h3>
          <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div class="flex items-center space-x-4 mb-4">
              <div
                class="h-10 w-10 bg-blue-900/50 text-blue-300 border border-blue-800 rounded-lg flex items-center justify-center"
              >
                <span class="material-symbols-outlined">corporate_fare</span>
              </div>
              <div>
                <h4 class="font-headline font-bold text-slate-100">Fibra Óptica Global</h4>
                <span class="text-xs font-body text-slate-400">Proveedor ISP Activo</span>
              </div>
            </div>
            <div class="space-y-3 pt-4 border-t border-slate-700">
              <div>
                <span class="block text-xs font-body text-slate-400 mb-1">ID de Contrato</span>
                <span class="block font-body font-medium text-slate-200">C-847291-MX</span>
              </div>
              <div>
                <span class="block text-xs font-body text-slate-400 mb-1">Estado de Conexión</span>
                <div
                  class="inline-flex items-center space-x-1.5 bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-800/50"
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  <span class="text-xs font-body font-semibold text-blue-400">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Help Snippet -->
        <div
          class="bg-slate-800/30 p-6 rounded-[0.75rem] border border-slate-700 flex items-start space-x-3"
        >
          <span class="material-symbols-outlined text-slate-500 text-xl mt-0.5">info</span>
          <p class="text-xs font-body text-slate-400 leading-relaxed">
            Cualquier cambio en la velocidad contratada afectará los cálculos históricos en la
            sección de <strong class="text-slate-200 font-semibold">Speed Analytics</strong>. Los
            cambios pueden tardar hasta 5 minutos en reflejarse en los monitores en vivo.
          </p>
        </div>
      </div>
    </div>

    <!-- Action Footer -->
    <div class="mt-12 pt-8 flex justify-end">
      <button
        class="bg-primary hover:bg-primary-dim text-white font-body font-semibold text-base px-8 py-3.5 rounded-[0.75rem] transition-all flex items-center space-x-2 shadow-sm border border-transparent"
      >
        <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1"
          >save</span
        >
        <span>Guardar Cambios</span>
      </button>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const signatureBase64 = ref(null)

const loadSignature = async () => {
  if (window.electron && window.electron.getSignature) {
    const sig = await window.electron.getSignature()
    if (sig) {
      signatureBase64.value = sig
    }
  }
}

const handleUploadSignature = async () => {
  if (window.electron && window.electron.uploadSignature) {
    const res = await window.electron.uploadSignature()
    if (res && res.success) {
      signatureBase64.value = res.base64
    }
  }
}

onMounted(() => {
  loadSignature()
})
</script>
