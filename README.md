# Calculadora de Ganancias

Una aplicación web y móvil diseñada para ayudar a pequeños empresarios y vendedores a gestionar su inventario y calcular sus ganancias de forma rápida y sencilla. La aplicación funciona de manera completamente local, guardando todos los datos en el dispositivo del usuario para garantizar la privacidad y el acceso sin conexión.

## ✨ Características Principales

- **Gestión de Inventario:** Añade, edita y elimina productos de tu inventario.
- **Importación Masiva:** Carga todo tu inventario de una sola vez usando un archivo de Excel (`.xlsx`).
- **Cálculo en Tiempo Real:** Introduce la cantidad vendida de cada producto y ve cómo se actualiza la ganancia total al instante.
- **Persistencia de Datos:** Toda la información (inventario y ventas) se guarda localmente en tu dispositivo. ¡No necesitas internet!
- **Historial de Ventas:** Guarda un registro de tus ventas diarias y consúltalo más tarde, filtrando por rango de fechas.
- **Exportación de Reportes:** Genera un archivo de Excel con el resumen de tus productos y las ganancias calculadas.
- **Personalización:** Elige entre tres temas visuales (Claro, Oscuro y Rosa Pastel) para adaptar la apariencia de la app a tu gusto.
- **Multiplataforma:** Funciona como una página web en cualquier navegador y también se puede compilar como una aplicación nativa para Android.

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Quasar Framework](https://quasar.dev/) (sobre [Vue 3](https://vuejs.org/))
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos Local:** [Dexie.js](https://dexie.org/) (una envoltura amigable para IndexedDB)
- **Lectura/Escritura de Excel:** [SheetJS (xlsx)](https://sheetjs.com/)

## 🚀 Guía de Instalación y Uso

Sigue estos pasos para poner en marcha el proyecto en tu propia máquina.

### Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- La CLI de Quasar:
  ```bash
  npm install -g @quasar/cli
  ```

### Instalación del Proyecto

1.  Clona este repositorio en tu máquina local.
2.  Navega hasta la carpeta del proyecto:
    ```bash
    cd nombre-de-la-carpeta
    ```
3.  Instala todas las dependencias:
    ```bash
    npm install
    ```

### Desarrollo Web

Para ejecutar la aplicación en modo de desarrollo en tu navegador (con recarga en caliente al hacer cambios):

```bash
quasar dev
```

La aplicación estará disponible en `http://localhost:9000`.

### Generar APK para Android

1.  **Instala Android Studio:** Descarga e instala [Android Studio](https://developer.android.com/studio) si aún no lo tienes.
2.  **Añade el modo Capacitor:** Ejecuta este comando una sola vez para preparar el proyecto para plataformas móviles.
    ```bash
    quasar mode add capacitor
    ```
3.  **Construye la aplicación:** Este comando compilará tu código web y lo copiará en un proyecto nativo de Android.
    ```bash
    quasar build -m capacitor -T android
    ```
4.  **Abre en Android Studio:**
    - Abre Android Studio.
    - Selecciona "Open" y navega hasta la carpeta `src-capacitor/android` dentro de tu proyecto.
5.  **Sincroniza y Compila:**
    - Espera a que Android Studio sincronice el proyecto.
    - Ve al menú `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
6.  **Encuentra tu APK:** Una vez que termine la compilación, haz clic en el enlace "locate" en la notificación para encontrar tu archivo `.apk` listo para instalar.

## 📁 Formato del Archivo Excel

Para importar productos correctamente, tu archivo `.xlsx` debe tener las siguientes 4 columnas en este orden exacto, y los datos deben empezar desde la primera fila (sin encabezados):

1.  **nombre:** El nombre del producto (Texto).
2.  **cantidad:** La cantidad total en inventario (Número).
3.  **costo_total:** El costo total de todas las unidades en inventario (Número).
4.  **precio_venta:** El precio de venta por una sola unidad (Número).
