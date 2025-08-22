<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from './utils/db'; // Importamos la DB
import type { SoldProduct, Transaction } from './types/models';

const $q = useQuasar();

/**
 * @param themeName El nombre del tema ('light', 'dark', 'pastel').
 */
function applyTheme(themeName: string) {
  // Guardar la preferencia del usuario
  localStorage.setItem('user-theme', themeName);

  // Lógica para el modo oscuro de Quasar
  $q.dark.set(themeName === 'dark');

  // Lógica para el tema personalizado
  // Añadimos o quitamos una clase del body para que el CSS reaccione
  if (themeName === 'pastel') {
    document.body.classList.add('theme-pastel');
  } else {
    document.body.classList.remove('theme-pastel');
  }
}
// --- LÓGICA DE MIGRACIÓN ---
async function runMigration() {
  const migrationCompleted = localStorage.getItem('migration-v5-complete');
  if (migrationCompleted) {
    return; // La migración ya se hizo, no hacer nada.
  }

  try {
    const oldSales = await db.soldProducts.toArray();
    if (oldSales.length > 0) {
      const newTransactions: Transaction[] = oldSales.map((sale: SoldProduct) => ({
        type: 'sale',
        date: sale.saleDate,
        name: sale.nombre,
        quantity: sale.cantidadVendida,
        unitCost: sale.costoUnitario,
        unitPrice: sale.precioVentaUnitario,
        profit: sale.ganancia,
        total: sale.precioVentaUnitario * sale.cantidadVendida,
      }));

      await db.transactions.bulkAdd(newTransactions);
      // Opcional: limpiar la tabla antigua después de migrar
      // await db.soldProducts.clear();
    }
    // Marcar la migración como completada
    localStorage.setItem('migration-v5-complete', 'true');
    console.log('Migración de datos a la nueva tabla de transacciones completada.');
  } catch (error) {
    console.error('Error durante la migración de datos:', error);
  }
}

// Cuando la aplicación se monta por primera vez...
onMounted(() => {
  void runMigration();
  // ...leemos el tema guardado en el almacenamiento local.
  const savedTheme = localStorage.getItem('user-theme');
  if (savedTheme) {
    // Si existe un tema guardado, lo aplicamos.
    applyTheme(savedTheme);
  } else {
    // Si no, aplicamos el tema claro por defecto.
    applyTheme('light');
  }
});
</script>
