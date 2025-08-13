<template>
  <q-page class="q-pa-md">
    <q-card flat>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Historial de Productos Vendidos</div>
        <div class="q-gutter-sm">
          <q-btn
            color="positive"
            icon="download"
            label="Exportar"
            @click="openExportDialog"
            :disable="allSales.length === 0"
          />
          <q-btn
            color="negative"
            icon="delete_sweep"
            label="Eliminar Ventas"
            @click="openMassDeleteDialog"
            :disable="allSales.length === 0"
          />
        </div>
      </q-card-section>

      <q-card-section class="row q-gutter-md items-center">
        <q-input
          v-model="searchTerm"
          label="Buscar por nombre..."
          dense
          filled
          class="col-12 col-sm-4 col-md-3"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <DatePicker v-model="dateRange.from" label="Desde" dense class="col-auto" />
        <DatePicker v-model="dateRange.to" label="Hasta" dense class="col-auto" />
        <q-btn @click="clearFilters" flat round dense icon="cleaning_services">
          <q-tooltip>Limpiar filtros</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-table
        :rows="filteredSalesForDisplay"
        :columns="columns"
        row-key="id"
        flat
        :loading="isLoading"
        no-data-label="No se encontraron ventas."
        :grid="$q.screen.lt.md"
        card-container-class="justify-center"
      >
        <template v-slot:top-right>
          <q-chip size="md" icon="paid" color="positive" text-color="white">
            <span class="text-weight-light q-mr-xs">Ganancia Mostrada:</span>
            <span class="text-weight-bold">{{ formatCurrency(totalProfitInRange) }}</span>
          </q-chip>
        </template>

        <!-- VISTA DE TARJETAS PARA MÓVILES -->
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6">
            <q-card bordered flat>
              <q-card-section class="row items-center justify-between bg-grey-2">
                <div class="text-subtitle1 text-weight-bold">
                  {{ formatDate(props.row.saleDate) }}
                </div>
                <q-btn
                  dense
                  round
                  flat
                  color="negative"
                  icon="delete"
                  @click="openSingleDeleteDialog(props.row.id)"
                />
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

        <!-- VISTA DE TABLA PARA ESCRITORIO -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              dense
              round
              flat
              color="negative"
              icon="delete"
              @click="openSingleDeleteDialog(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIÁLOGOS DE CONFIRMACIÓN -->
    <q-dialog v-model="isConfirmSingleDeleteVisible">
      <q-card
        ><q-card-section class="row items-center"
          ><q-avatar icon="warning" color="negative" text-color="white" /><span class="q-ml-sm"
            >¿Estás seguro de que quieres eliminar esta venta?</span
          ></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat label="Cancelar" v-close-popup /><q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="confirmSingleDelete" /></q-card-actions
      ></q-card>
    </q-dialog>

    <q-dialog v-model="isConfirmMassDeleteVisible">
      <q-card
        ><q-card-section class="row items-center"
          ><q-avatar icon="warning" color="negative" text-color="white" /><span class="q-ml-sm">{{
            massDeleteMessage
          }}</span></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat label="Cancelar" v-close-popup /><q-btn
            flat
            label="Sí, Eliminar"
            color="negative"
            @click="confirmMassDelete" /></q-card-actions
      ></q-card>
    </q-dialog>

    <q-dialog v-model="isConfirmExportVisible">
      <q-card
        ><q-card-section class="row items-center"
          ><q-avatar icon="download" color="positive" text-color="white" /><span class="q-ml-sm">{{
            exportMessage
          }}</span></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat label="Cancelar" v-close-popup /><q-btn
            flat
            label="Sí, Exportar"
            color="positive"
            @click="confirmExport" /></q-card-actions
      ></q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date as qDate, type QTableProps } from 'quasar';
import { utils, writeFile } from 'xlsx';
import { db } from 'src/utils/db';
import type { SoldProduct } from 'src/types/models';
import DatePicker from 'src/components/DatePicker.vue';
import { showSuccessNotification, showErrorNotification } from 'src/utils/notifications';

// --- STATE ---
const isLoading = ref(true);
const allSales = ref<SoldProduct[]>([]);
const dateRange = ref<{ from: number | null; to: number | null }>({ from: null, to: null });
const searchTerm = ref('');
const isConfirmSingleDeleteVisible = ref(false);
const isConfirmMassDeleteVisible = ref(false);
const isConfirmExportVisible = ref(false);
const saleToDeleteId = ref<number | null>(null);

// --- DATA FETCHING ---
onMounted(async () => {
  await loadSalesFromDB();
});

async function loadSalesFromDB() {
  isLoading.value = true;
  allSales.value = await db.soldProducts.orderBy('saleDate').reverse().toArray();
  isLoading.value = false;
}

// --- COMPUTED & METHODS ---

// Filtra solo por fecha para las acciones de exportar y eliminar
const salesFilteredByDate = computed(() => {
  if (!dateRange.value.from || !dateRange.value.to) {
    return allSales.value;
  }
  const toTimestamp = dateRange.value.to + (24 * 60 * 60 * 1000 - 1);
  return allSales.value.filter(
    (sale) => sale.saleDate >= dateRange.value.from! && sale.saleDate <= toTimestamp,
  );
});

// Filtra por nombre ADEMÁS de por fecha, solo para mostrar en la tabla
const filteredSalesForDisplay = computed(() => {
  if (!searchTerm.value) {
    return salesFilteredByDate.value;
  }
  return salesFilteredByDate.value.filter((sale) =>
    sale.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );
});

const totalProfitInRange = computed(() => {
  return filteredSalesForDisplay.value.reduce((total, sale) => total + sale.ganancia, 0);
});

const massDeleteMessage = computed(() => {
  return dateRange.value.from && dateRange.value.to
    ? 'Se eliminarán todas las ventas en el rango de fechas seleccionado. ¿Continuar?'
    : 'No hay un rango de fechas seleccionado. Se eliminarán TODAS las ventas del historial. ¿Continuar?';
});

const exportMessage = computed(() => {
  return dateRange.value.from && dateRange.value.to
    ? 'Se exportarán las ventas en el rango de fechas seleccionado.'
    : 'No hay un rango de fechas seleccionado. Se exportarán TODAS las ventas del historial.';
});

function clearFilters() {
  dateRange.value = { from: null, to: null };
  searchTerm.value = '';
}

// --- DIALOG HANDLERS ---
function openSingleDeleteDialog(id: number | undefined) {
  if (id) {
    saleToDeleteId.value = id;
    isConfirmSingleDeleteVisible.value = true;
  }
}

async function confirmSingleDelete() {
  if (!saleToDeleteId.value) return;
  try {
    await db.soldProducts.delete(saleToDeleteId.value);
    await loadSalesFromDB();
    showSuccessNotification('Venta eliminada con éxito.');
  } catch {
    showErrorNotification('Error al eliminar la venta.');
  } finally {
    isConfirmSingleDeleteVisible.value = false;
    saleToDeleteId.value = null;
  }
}

function openMassDeleteDialog() {
  isConfirmMassDeleteVisible.value = true;
}

async function confirmMassDelete() {
  // Usa la lista filtrada solo por fecha
  const idsToDelete = salesFilteredByDate.value.map((s) => s.id!);
  try {
    await db.soldProducts.bulkDelete(idsToDelete);
    await loadSalesFromDB();
    showSuccessNotification('Ventas eliminadas con éxito.');
  } catch {
    showErrorNotification('Error al eliminar las ventas.');
  } finally {
    isConfirmMassDeleteVisible.value = false;
  }
}

function openExportDialog() {
  isConfirmExportVisible.value = true;
}

function confirmExport() {
  // Usa la lista filtrada solo por fecha
  const dataToExport = salesFilteredByDate.value.map((p) => ({
    fecha_venta: formatDate(p.saleDate),
    producto: p.nombre,
    cantidad_vendida: p.cantidadVendida,
    precio_venta_unitario: p.precioVentaUnitario,
    costo_unitario: p.costoUnitario,
    ganancia: p.ganancia,
  }));

  const worksheet = utils.json_to_sheet(dataToExport);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Historial de Ventas');
  writeFile(workbook, 'HistorialVentas.xlsx');
  isConfirmExportVisible.value = false;
}

// --- FORMATTERS ---
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
    name: 'ganancia',
    label: 'Ganancia',
    field: 'ganancia',
    format: formatCurrency,
    align: 'right',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
];
</script>
