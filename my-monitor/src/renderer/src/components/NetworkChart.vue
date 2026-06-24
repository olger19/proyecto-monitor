<template>
  <div class="chart-container w-full h-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
)

const { chartData } = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 }, // Instant update
  plugins: {
    legend: {
      display: false // Hide built-in legend (using custom dashboard legend)
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#f8fafc',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10,
      bodyFont: {
        family: 'Inter'
      },
      titleFont: {
        family: 'Inter',
        weight: 'bold'
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'transparent'
      },
      ticks: {
        color: '#64748b',
        font: {
          family: 'Inter',
          size: 10
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'transparent'
      },
      ticks: {
        color: '#64748b',
        font: {
          family: 'Inter',
          size: 10
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>
