/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-tint': '#3b82f6',
        'surface-bright': '#1e293b',
        'tertiary-container': '#334155',
        'surface-container': '#1e293b',
        'surface-dim': '#0f172a',
        'surface-container-high': '#334155',
        outline: '#94a3b8',
        error: '#f87171',
        'inverse-on-surface': '#f8fafc',
        'surface-container-lowest': '#0f172a',
        'inverse-primary': '#60a5fa',
        'secondary-fixed': '#1e293b',
        'secondary-dim': '#94a3b8',
        'on-error': '#ffffff',
        'secondary-fixed-dim': '#334155',
        primary: '#3b82f6',
        'tertiary-dim': '#cbd5e1',
        'on-surface-variant': '#94a3b8',
        surface: '#0f172a',
        'secondary-container': '#1e293b',
        'on-secondary-container': '#f1f5f9',
        'error-container': '#991b1b',
        'on-surface': '#f8fafc',
        'primary-fixed-dim': '#2563eb',
        'on-error-container': '#fecaca',
        'surface-variant': '#334155',
        'on-secondary-fixed': '#f1f5f9',
        'primary-container': '#1e3a8a',
        'surface-container-highest': '#475569',
        'on-primary-fixed': '#eff6ff',
        'tertiary-fixed-dim': '#475569',
        'on-tertiary': '#f8fafc',
        secondary: '#64748b',
        'on-secondary-fixed-variant': '#cbd5e1',
        background: '#0f172a',
        'surface-container-low': '#1e293b',
        tertiary: '#94a3b8',
        'on-primary-fixed-variant': '#dbeafe',
        'on-background': '#f8fafc',
        'outline-variant': '#475569',
        'error-dim': '#7f1d1d',
        'tertiary-fixed': '#1e293b',
        'inverse-surface': '#f8fafc',
        'on-secondary': '#f8fafc',
        'primary-fixed': '#3b82f6',
        'primary-dim': '#2563eb',
        'on-primary': '#ffffff',
        'on-tertiary-fixed-variant': '#f1f5f9',
        'on-tertiary-fixed': '#f8fafc',
        'on-tertiary-container': '#f1f5f9',
        'on-primary-container': '#dbeafe'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.75rem',
        full: '0.75rem'
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
