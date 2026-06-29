<template>
  <div class="pt-28 px-12 pb-24 max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12">
      <h1 class="font-headline text-4xl font-extrabold text-slate-100 mb-2 tracking-tight">
        Historial Semanal
      </h1>
      <p class="text-slate-400 font-body text-base">
        Reportes de rendimiento curados de la semana actual.
      </p>
    </div>

    <!-- List Container -->
    <div class="space-y-6">
      <!-- Report Item 1 -->
      <div
        class="dark:bg-slate-900 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between transition-all hover:bg-surface-container-low dark:hover:bg-slate-800 border border-slate-800/20"
      >
        <div class="flex items-center space-x-6">
          <div
            class="w-12 h-12 rounded-full dark:bg-blue-900/40 bg-primary-container flex items-center justify-center text-on-primary-container dark:text-blue-200 shrink-0"
          >
            <span class="material-symbols-outlined">description</span>
          </div>
          <div>
            <p class="font-body text-sm font-semibold dark:text-slate-100 text-on-surface mb-1">
              Viernes, 27 Octubre 2023
            </p>
            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full dark:bg-blue-900/40 bg-primary-container text-on-primary-container dark:text-blue-200 text-xs font-medium"
              >
                99.9% Disponibilidad
              </span>
              <span class="text-on-surface-variant dark:text-slate-400 text-sm font-body">
                Estado Óptimo
              </span>
            </div>
          </div>
        </div>
        <button
          class="bg-primary text-white px-5 py-2.5 rounded-xl font-body font-semibold text-sm hover:bg-primary-dim transition-colors flex items-center space-x-2"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          <span>Descargar PDF</span>
        </button>
      </div>

      <!-- Report Item 2 -->
      <div
        class="dark:bg-slate-900 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between transition-all hover:bg-surface-container-low dark:hover:bg-slate-800 border border-slate-800/20"
      >
        <div class="flex items-center space-x-6">
          <div
            class="w-12 h-12 rounded-full dark:bg-slate-800 bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-slate-400 shrink-0"
          >
            <span class="material-symbols-outlined">description</span>
          </div>
          <div>
            <p class="font-body text-sm font-semibold dark:text-slate-100 text-on-surface mb-1">
              Jueves, 26 Octubre 2023
            </p>
            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full dark:bg-blue-900/40 bg-primary-container text-on-primary-container dark:text-blue-200 text-xs font-medium"
              >
                99.8% Disponibilidad
              </span>
              <span class="text-on-surface-variant dark:text-slate-400 text-sm font-body">
                Mantenimiento Menor
              </span>
            </div>
          </div>
        </div>
        <button
          class="bg-primary text-white px-5 py-2.5 rounded-xl font-body font-semibold text-sm hover:bg-primary-dim transition-colors flex items-center space-x-2"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          <span>Descargar PDF</span>
        </button>
      </div>

      <!-- Report Item 3 -->
      <div
        class="dark:bg-slate-900 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between transition-all hover:bg-surface-container-low dark:hover:bg-slate-800 border border-slate-800/20"
      >
        <div class="flex items-center space-x-6">
          <div
            class="w-12 h-12 rounded-full dark:bg-slate-800 bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-slate-400 shrink-0"
          >
            <span class="material-symbols-outlined">description</span>
          </div>
          <div>
            <p class="font-body text-sm font-semibold dark:text-slate-100 text-on-surface mb-1">
              Miércoles, 25 Octubre 2023
            </p>
            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full dark:bg-blue-900/40 bg-primary-container text-on-primary-container dark:text-blue-200 text-xs font-medium"
              >
                100% Disponibilidad
              </span>
              <span class="text-on-surface-variant dark:text-slate-400 text-sm font-body">
                Rendimiento Perfecto
              </span>
            </div>
          </div>
        </div>
        <button
          class="bg-primary text-white px-5 py-2.5 rounded-xl font-body font-semibold text-sm hover:bg-primary-dim transition-colors flex items-center space-x-2"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          <span>Descargar PDF</span>
        </button>
      </div>

      <!-- Report Item 4 -->
      <div
        class="dark:bg-slate-900 bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between transition-all hover:bg-surface-container-low dark:hover:bg-slate-800 border border-slate-800/20"
      >
        <div class="flex items-center space-x-6">
          <div
            class="w-12 h-12 rounded-full dark:bg-slate-800 bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-slate-400 shrink-0"
          >
            <span class="material-symbols-outlined">description</span>
          </div>
          <div>
            <p class="font-body text-sm font-semibold dark:text-slate-100 text-on-surface mb-1">
              Martes, 24 Octubre 2023
            </p>
            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full dark:bg-blue-900/40 bg-primary-container text-on-primary-container dark:text-blue-200 text-xs font-medium"
              >
                99.9% Disponibilidad
              </span>
              <span class="text-on-surface-variant dark:text-slate-400 text-sm font-body">
                Estado Óptimo
              </span>
            </div>
          </div>
        </div>
        <button
          class="bg-primary text-white px-5 py-2.5 rounded-xl font-body font-semibold text-sm hover:bg-primary-dim transition-colors flex items-center space-x-2"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          <span>Descargar PDF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Static presentation view for now
</script>
