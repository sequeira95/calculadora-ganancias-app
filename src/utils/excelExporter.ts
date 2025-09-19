import { utils, write } from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { showSuccessNotification, showErrorNotification } from 'src/utils/notifications';

// Definimos una interfaz para los parámetros para que sea más claro y escalable
interface ExportParams<T extends Record<string, unknown>> {
  data: T[];
  fileName: string;
  worksheetName?: string;
}

/**
 * Función reutilizable y 100% tipada para exportar un array de datos a un archivo Excel.
 * Detecta si la app se ejecuta en web o Capacitor y usa el método de descarga apropiado.
 * @param {ExportParams<T>} params - Objeto con los datos, nombre de archivo y la instancia de Quasar.
 */
export async function exportToExcel<T extends Record<string, unknown>>({
  data,
  fileName,
  worksheetName = 'Reporte',
}: ExportParams<T>): Promise<void> {
  if (!data || data.length === 0) {
    showErrorNotification('No hay datos para exportar.');
    return;
  }

  if (!fileName.endsWith('.xlsx')) {
    fileName += '.xlsx';
  }
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, worksheetName);

  if (Capacitor.getPlatform() === 'web') {
    // 👉 WEB: descarga normal
    void import('xlsx').then(({ writeFile }) => {
      writeFile(workbook, fileName);
    });
    showSuccessNotification('Reporte exportado con éxito.');
    return;
  }

  // 👉 MÓVIL
  try {
    // 1. Generar buffer Excel
    const excelBuffer = write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // 2. Convertir a base64
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bytes.subarray(i, i + chunkSize) as any,
      );
    }
    const base64 = btoa(binary);
    console.log('Archivo convertido a base64, tamaño:', base64.length);

    // 3. Pedir permisos
    try {
      await Filesystem.requestPermissions();
      console.log('Permisos de Filesystem concedidos ✅');
    } catch (err) {
      console.error('Error solicitando permisos:', err);
      showErrorNotification('Error solicitando permisos: ' + JSON.stringify(err));
      return;
    }

    // 4. Guardar en diferentes directorios
    const directories = [Directory.Documents, Directory.External, Directory.Data];

    let saved = false;
    let savedFile = null;
    for (const dir of directories) {
      try {
        savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: dir,
        });
        console.log(`Archivo guardado en: ${dir}/${fileName}`);
        showSuccessNotification(`Reporte exportado con éxito en ${dir} 📂`);
        saved = true;
        break;
      } catch (err) {
        console.error(`No se pudo guardar en ${dir}:`, err);
        showErrorNotification(`No se pudo guardar en ${dir}: ${JSON.stringify(err)}`);
      }
    }
    if (savedFile) {
      try {
        await FileOpener.open({
          filePath: savedFile.uri,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } catch (err) {
        console.error('Error al abrir archivo:', err);
        showErrorNotification(
          'No se pudo abrir el archivo, instala una app que soporte Excel.' + JSON.stringify(err),
        );
      }
    }

    if (!saved) {
      console.error('No se pudo guardar en ningún directorio disponible.');
      showErrorNotification('No se pudo guardar en ningún directorio disponible.');
    }
  } catch (err) {
    console.error('Error exportando Excel en móvil:', err);
    showErrorNotification('Error exportando Excel en móvil: ' + JSON.stringify(err));
  }
}
