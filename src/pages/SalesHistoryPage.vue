<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Historial de Productos Vendidos</div>
      </q-card-section>

      <q-card-section class="row q-gutter-md items-center">
        <DatePicker v-model="dateRange.from" label="Desde" />
        <DatePicker v-model="dateRange.to" label="Hasta" />
        <q-btn label="Limpiar" @click="clearDateRange" flat />
      </q-card-section>
      <q-separator />

      <q-table
        :rows="filteredSales"
        :columns="columns"
        row-key="id"
        flat
        :loading="isLoading"
        no-data-label="No se encontraron ventas en el rango de fechas seleccionado."
        :grid="$q.screen.lt.md"
        card-container-class="justify-center"
      >
        <template v-slot:top-right>
          <q-chip size="md" icon="paid" color="positive" text-color="white">
            <span class="text-weight-light q-mr-xs">Ganancia del Periodo:</span>
            <span class="text-weight-bold">{{ formatCurrency(totalProfitInRange) }}</span>
          </q-chip>
        </template>

        <!-- VISTA DE TARJETAS PARA MÓVILES -->
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6">
            <q-card bordered flat>
              <q-card-section class="text-center bg-grey-2">
                <div class="text-subtitle1 text-weight-bold">
                  {{ formatDate(props.row.saleDate) }}
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-gutter-sm">
                <div class="text-h6 text-center q-mb-md">{{ props.row.nombre }}</div>
                <div class="row justify-between">
                  <span class="text-caption text-grey">Cant. Vendida:</span>
                  <span class="text-weight-medium">{{ props.row.cantidadVendida }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-caption text-grey">Precio Venta:</span>
                  <span class="text-weight-medium">{{
                    formatCurrency(props.row.precioVentaUnitario)
                  }}</span>
                </div>
                <div class="row justify-between text-positive text-weight-bold">
                  <span class="text-caption">Ganancia:</span>
                  <span>{{ formatCurrency(props.row.ganancia) }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date as qDate, type QTableProps } from 'quasar';
import { db } from 'src/utils/db';
import type { SoldProduct } from 'src/types/models';
import DatePicker from 'src/components/DatePicker.vue';

// --- STATE ---
const isLoading = ref(true);
const allSales = ref<SoldProduct[]>([]);
const dateRange = ref<{ from: number | null; to: number | null }>({ from: null, to: null });

// --- DATA FETCHING ---
onMounted(async () => {
  allSales.value = await db.soldProducts.orderBy('saleDate').reverse().toArray();
  isLoading.value = false;
});

// --- COMPUTED & METHODS ---
const filteredSales = computed(() => {
  if (!dateRange.value.from || !dateRange.value.to) {
    return allSales.value;
  }
  // Ajusta 'to' para que incluya el día completo
  const toTimestamp = dateRange.value.to + (24 * 60 * 60 * 1000 - 1);

  return allSales.value.filter(
    (sale) => sale.saleDate >= dateRange.value.from! && sale.saleDate <= toTimestamp,
  );
});

const totalProfitInRange = computed(() => {
  return filteredSales.value.reduce((total, sale) => total + sale.ganancia, 0);
});

function clearDateRange() {
  dateRange.value = { from: null, to: null };
}

function formatDate(timestamp: number): string {
  return qDate.formatDate(timestamp, 'DD/MM/YYYY');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// --- TABLE COLUMNS ---
const columns: QTableProps['columns'] = [
  {
    name: 'saleDate',
    label: 'Fecha Venta',
    field: 'saleDate',
    format: formatDate,
    align: 'left',
    sortable: true,
  },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'cantidadVendida',
    label: 'Cant. Vendida',
    field: 'cantidadVendida',
    align: 'center',
    sortable: true,
  },
  {
    name: 'precioVentaUnitario',
    label: 'Precio Venta',
    field: 'precioVentaUnitario',
    format: formatCurrency,
    align: 'right',
  },
  {
    name: 'ganancia',
    label: 'Ganancia',
    field: 'ganancia',
    format: formatCurrency,
    align: 'right',
    sortable: true,
  },
];
</script>
