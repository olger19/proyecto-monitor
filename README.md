# The Digital Curator - Monitor de Conectividad de Red

<p align="center">
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

Este es el repositorio del **Sistema de Monitoreo y Diagnóstico de Red para la Sustentación de Tesis**. El sistema vigila el estado del servicio contratado de internet, calcula el **Índice de Calidad de Red (ICR)** en base a umbrales normativos, permite configurar las firmas de la institución y genera reportes consolidados semanales en PDF.

---

## Estructura del Proyecto

El repositorio está dividido en dos grandes componentes:

*   **`network-engine/`**: Motor de diagnóstico en segundo plano desarrollado en **Go (Golang)**. Se comunica mediante JSON a través de la salida estándar (stdout).
*   **`my-monitor/`**: Interfaz de escritorio y shell de sistema desarrollada en **Electron** con frontend en **Vue 3** (Composition API) y empaquetado con **Vite**.

---

## Tecnologías Utilizadas

*   **Motor de Diagnóstico**: <span style="background-color: #00ADD8; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">Go (Golang)</span>
*   **Contenedor de Escritorio**: <span style="background-color: #47848F; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">Electron</span>
*   **Framework Frontend**: <span style="background-color: #35495E; color: #4FC08D; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">Vue 3</span>
*   **Gestión de Estilos**: <span style="background-color: #38B2AC; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">Tailwind CSS</span>
*   **Base de Datos**: <span style="background-color: #07405E; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">SQLite (better-sqlite3)</span> con fallback a <span style="background-color: #ea580c; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">JSON plano</span> para máxima resiliencia.
*   **Suite de Pruebas**: <span style="background-color: #729B1B; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">Vitest</span>

---

## Guía de Instalación y Ejecución

### Requisitos Previos
Asegúrese de tener instalados los siguientes componentes en su sistema:
*   [Node.js](https://nodejs.org/) (versión v20 o superior recomendada)
*   [Go (Golang)](https://go.dev/dl/) (versión 1.20 o superior recomendada)

---

### Paso 1: Compilar el Motor de Diagnóstico (Go)
Ingrese a la carpeta del motor y genere el binario ejecutable para Windows:

```bash
# Navegar a la carpeta del motor
cd network-engine

# Compilar el archivo de Go
go build -o engine.exe main.go

# Copiar el binario generado a la carpeta de recursos de la aplicación Electron
Copy-Item engine.exe -Destination ..\my-monitor\resources\bin\engine.exe -Force
```

---

### Paso 2: Configurar la Aplicación de Escritorio (Electron + Vue)
Navegue a la carpeta del frontend y cargue las dependencias de desarrollo y producción:

```bash
# Regresar a la raíz y entrar a la aplicación
cd ../my-monitor

# Instalar dependencias
npm install
```

---

### Paso 3: Ejecución de la Aplicación

#### Ejecutar en Modo Desarrollo:
Inicia el entorno caliente de desarrollo (HMR) con recarga automática:
```bash
npm run dev
```

#### Ejecutar Suite de Pruebas Unitarias:
Valida la integridad de la base de datos, los cálculos de promedios de la gráfica y la exactitud de la fórmula del ICR:
```bash
npm run test
```

#### Compilar el Instalador para Windows (`.exe`):
Empaqueta todo el proyecto y genera un instalador de un solo clic en la carpeta `dist/`:
```bash
npm run build:win
```
