# The Digital Curator - Interfaz de Escritorio (Electron + Vue 3)

<p align="center">
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

Esta carpeta contiene el código fuente de la interfaz de usuario de escritorio basada en **Electron** y empaquetada mediante **Vite**.

---

## Tecnologías del Proyecto

- **Entorno**: <span style="background-color: #47848F; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">Electron (Vite-Electron)</span>
- **Diseño Frontend**: <span style="background-color: #35495E; color: #4FC08D; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">Vue 3 (Composition API)</span>
- **Estilos**: <span style="background-color: #38B2AC; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">Tailwind CSS</span>
- **Persistencia Local**: <span style="background-color: #07405E; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">SQLite (better-sqlite3)</span> y <span style="background-color: #ea580c; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">JSON local</span>.
- **Suite de Pruebas**: <span style="background-color: #729B1B; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">Vitest</span>

---

## Scripts de Desarrollo y Despliegue

Asegúrese de ejecutar estos comandos dentro de la carpeta `my-monitor/`:

### 1. Instalación de dependencias

```bash
npm install
```

### 2. Entorno de Desarrollo (HMR)

Inicia la interfaz de Electron y compila el frontend en tiempo real:

```bash
npm run dev
```

### 3. Ejecutar Suite de Pruebas Unitarias

Ejecuta las pruebas de la fórmula de calidad de red, cálculo de promedios de la gráfica e integridad de guardado de datos:

```bash
npm run test
```

### 4. Linter de Código y Formateo

Comprueba la consistencia sintáctica y formatea los archivos de código:

```bash
# Verificar linter de ESLint
npm run lint

# Formatear el código con Prettier
npm run format
```

### 5. Compilación del Instalador para Producción

Empaqueta y crea un instalador autocontenido para Windows (`.exe`):

```bash
npm run build:win
```

---

## Características Especiales de Arquitectura

- **Firma del Director**: La interfaz permite cargar una imagen de firma física (.jpg/.jpeg/.png). El sistema lee el archivo, lo convierte a Base64 y lo almacena de forma persistente en el disco del usuario (`signature_data.txt`). Al exportar el reporte, el generador estampa esta firma de forma digitalizada.
- **Base de Datos Resiliente**: El sistema de almacenamiento local intenta usar una base de datos local SQLite. Si la carga nativa del controlador falla en el entorno operativo (v.g. discrepancia de versión en pruebas de consola), el sistema activa sin interrupción un motor alternativo que escribe y lee de un archivo plano cifrado en formato JSON (`database.json`), garantizando tolerancia a fallos.
