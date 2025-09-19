<template>
  <q-page class="q-pa-md">
    <q-card flat>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Historial de Transacciones</div>
        <div class="q-gutter-sm">
          <q-btn
            color="positive"
            icon="download"
            label="Exportar"
            @click="openExportDialog"
            :disable="allTransactions.length === 0"
          />
          <q-btn
            color="negative"
            icon="delete_sweep"
            label="Eliminar"
            @click="openMassDeleteDialog"
            :disable="filteredTransactions.length === 0"
          >
            <q-tooltip>Elimina las transacciones mostradas actualmente</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section class="row q-gutter-md items-center">
        <q-input
          v-model="searchTerm"
          label="Buscar por nombre..."
          dense
          filled
          class="col-12 col-sm-3 col-md-3"
          clearable
        >
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="typeFilter"
          :options="typeOptions"
          label="Tipo"
          dense
          filled
          class="col-12 col-sm-auto col-md-2"
          emit-value
          map-options
        />
        <DatePicker v-model="dateRange.from" label="Desde" dense class="col-auto" />
        <DatePicker v-model="dateRange.to" label="Hasta" dense class="col-auto" />
        <q-btn @click="clearFilters" flat round dense icon="cleaning_services">
          <q-tooltip>Limpiar filtros</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-table
        :rows="filteredTransactions"
        :columns="columns"
        row-key="id"
        flat
        :loading="isLoading"
        no-data-label="No se encontraron transacciones."
        :grid="$q.screen.lt.md"
        card-container-class="justify-center"
      >
        <template v-slot:top-right>
          <div class="q-gutter-sm row items-center">
            <q-chip size="sm" icon="functions" color="grey-8" text-color="white">
              <span class="text-weight-light q-mr-xs">Items:</span>
              <span class="text-weight-bold">
                (<span style="color: #ffcdd2">{{ totalExpenseItems }}</span>
                |
                <span style="color: #c8e6c9">{{ totalSaleItems }}</span
                >)
              </span>
            </q-chip>
            <q-chip size="sm" icon="arrow_upward" color="positive" text-color="white">
              <span class="text-weight-light q-mr-xs">Total Ventas:</span>
              <span class="text-weight-bold">{{ formatCurrency(totalSales) }}</span>
            </q-chip>
            <q-chip size="sm" icon="arrow_downward" color="negative" text-color="white">
              <span class="text-weight-light q-mr-xs">Total Gastos:</span>
              <span class="text-weight-bold">{{ formatCurrency(totalExpenses) }}</span>
            </q-chip>
            <q-chip size="sm" icon="payments" color="info" text-color="white">
              <span class="text-weight-light q-mr-xs">Ganancia Bruta:</span>
              <span class="text-weight-bold">{{ formatCurrency(totalGrossProfit) }}</span>
            </q-chip>
            <q-chip
              size="sm"
              :icon="netTotal >= 0 ? 'trending_up' : 'trending_down'"
              :color="netTotal >= 0 ? 'primary' : 'deep-orange'"
              text-color="white"
            >
              <span class="text-weight-light q-mr-xs">Balance Neto (Ganancia):</span>
              <span class="text-weight-bold">{{ formatCurrency(netTotal) }}</span>
            </q-chip>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6">
            <q-card bordered flat :dark="$q.dark.isActive">
              <q-card-section
                class="row items-center justify-between"
                :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
              >
                <div class="text-subtitle1 text-weight-bold">{{ formatDate(props.row.date) }}</div>
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
                <div class="text-h6 text-center q-mb-md">{{ props.row.name }}</div>
                <div class="row justify-between items-center">
                  <span class="text-caption text-grey">Tipo:</span>
                  <q-chip
                    dense
                    :color="props.row.type === 'sale' ? 'positive' : 'negative'"
                    text-color="white"
                    :label="props.row.type === 'sale' ? 'Venta' : 'Gasto'"
                  />
                </div>
                <div class="row justify-between">
                  <span class="text-caption text-grey">Cantidad:</span>
                  <span class="text-weight-medium">{{ props.row.quantity }}</span>
                </div>
                <div v-if="props.row.type === 'sale'" class="row justify-between text-positive">
                  <span class="text-caption">Ganancia:</span>
                  <span class="text-weight-bold">{{ formatCurrency(props.row.profit) }}</span>
                </div>
                <div
                  class="row justify-between text-weight-bold"
                  :class="props.row.type === 'expense' ? 'text-negative' : ''"
                >
                  <span class="text-caption">Monto Total:</span>
                  <span>{{ formatCurrency(props.row.total) }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-chip
              dense
              size="sm"
              :color="props.row.type === 'sale' ? 'positive' : 'negative'"
              text-color="white"
              :label="props.row.type === 'sale' ? 'Venta' : 'Gasto'"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-total="props">
          <q-td
            :props="props"
            :class="props.row.type === 'expense' ? 'text-negative' : 'text-weight-bold'"
          >
            {{ formatCurrency(props.row.total) }}
          </q-td>
        </template>
        <template v-slot:body-cell-profit="props">
          <q-td :props="props" :class="props.row.type === 'sale' ? 'text-positive' : ''">
            {{ props.row.type === 'sale' ? formatCurrency(props.row.profit) : '—' }}
          </q-td>
        </template>
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

    <q-dialog v-model="isConfirmSingleDeleteVisible">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que quieres eliminar esta transacción?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="confirmSingleDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isConfirmMassDeleteVisible">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ massDeleteMessage }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Sí, Eliminar" color="negative" @click="confirmMassDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isConfirmExportVisible">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="download" color="positive" text-color="white" />
          <span class="q-ml-sm"
            >Se exportarán las {{ filteredTransactions.length }} transacciones mostradas
            actualmente.</span
          >
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Sí, Exportar" color="positive" @click="confirmExport" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
// CAMBIO 3: Importar useQuasar
import { useQuasar, date as qDate, type QTableProps } from 'quasar';
import { db } from 'src/utils/db';
import type { Transaction } from 'src/types/models';
import DatePicker from 'src/components/DatePicker.vue';
import { showSuccessNotification, showErrorNotification } from 'src/utils/notifications';
import { exportToExcel as exportUtil } from 'src/utils/excelExporter';

// CAMBIO 4: Inicializar $q para usarlo en el template
const $q = useQuasar();

// --- ESTADO ---
const isLoading = ref(true);
const allTransactions = ref<Transaction[]>([]);
const dateRange = ref<{ from: number | null; to: number | null }>({ from: null, to: null });
const searchTerm = ref('');
const typeFilter = ref('all'); // 'all', 'sale', 'expense'
const typeOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Ventas', value: 'sale' },
  { label: 'Gastos', value: 'expense' },
];

const isConfirmSingleDeleteVisible = ref(false);
const isConfirmMassDeleteVisible = ref(false);
const isConfirmExportVisible = ref(false);
const transactionToDeleteId = ref<number | null>(null);

// --- OBTENCIÓN DE DATOS ---
async function loadTransactionsFromDB() {
  isLoading.value = true;
  allTransactions.value = await db.transactions.orderBy('date').reverse().toArray();
  isLoading.value = false;
}
onMounted(loadTransactionsFromDB);

// --- LÓGICA DE FILTRADO Y COMPUTADAS ---
const filteredTransactions = computed(() => {
  return allTransactions.value.filter((tx) => {
    const dateFrom = !dateRange.value.from || tx.date >= dateRange.value.from;
    const dateTo = !dateRange.value.to || tx.date <= dateRange.value.to + 86400000 - 1;
    const search =
      !searchTerm.value || tx.name.toLowerCase().includes(searchTerm.value.toLowerCase());
    const type = typeFilter.value === 'all' || tx.type === typeFilter.value;
    return dateFrom && dateTo && search && type;
  });
});

// --- MARCADORES ---
const totalSales = computed(() => {
  return filteredTransactions.value
    .filter((tx) => tx.type === 'sale')
    .reduce((sum, tx) => sum + tx.total, 0);
});

const totalExpenses = computed(() => {
  return filteredTransactions.value
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.total, 0);
});

const totalGrossProfit = computed(() => {
  return filteredTransactions.value
    .filter((tx) => tx.type === 'sale')
    .reduce((sum, tx) => sum + (tx.profit || 0), 0);
});

const totalSaleItems = computed(() => {
  return filteredTransactions.value.filter((tx) => tx.type === 'sale').length;
});

const totalExpenseItems = computed(() => {
  return filteredTransactions.value.filter((tx) => tx.type === 'expense').length;
});

const netTotal = computed(() => {
  return totalGrossProfit.value + totalExpenses.value;
});

const massDeleteMessage = computed(() => {
  const count = filteredTransactions.value.length;
  return `Se eliminarán ${count} transacciones basadas en los filtros actuales. Esta acción no se puede deshacer. ¿Continuar?`;
});

function clearFilters() {
  dateRange.value = { from: null, to: null };
  searchTerm.value = '';
  typeFilter.value = 'all';
}

// --- MANEJO DE DIÁLOGOS (ELIMINAR) ---
function openSingleDeleteDialog(id: number | undefined) {
  if (id) {
    transactionToDeleteId.value = id;
    isConfirmSingleDeleteVisible.value = true;
  }
}

async function confirmSingleDelete() {
  if (!transactionToDeleteId.value) return;
  try {
    await db.transactions.delete(transactionToDeleteId.value);
    await loadTransactionsFromDB();
    showSuccessNotification('Transacción eliminada con éxito.');
  } catch {
    showErrorNotification('Error al eliminar la transacción.');
  } finally {
    isConfirmSingleDeleteVisible.value = false;
    transactionToDeleteId.value = null;
  }
}

function openMassDeleteDialog() {
  if (filteredTransactions.value.length > 0) {
    isConfirmMassDeleteVisible.value = true;
  } else {
    showErrorNotification('No hay transacciones para eliminar con los filtros actuales.');
  }
}

async function confirmMassDelete() {
  const idsToDelete = filteredTransactions.value.map((tx) => tx.id!);
  try {
    await db.transactions.bulkDelete(idsToDelete);
    await loadTransactionsFromDB();
    showSuccessNotification(`${idsToDelete.length} transacciones eliminadas con éxito.`);
  } catch {
    showErrorNotification('Error al eliminar las transacciones.');
  } finally {
    isConfirmMassDeleteVisible.value = false;
  }
}

// --- MANEJO DE DIÁLOGOS (EXPORTAR) ---
function openExportDialog() {
  if (filteredTransactions.value.length > 0) {
    isConfirmExportVisible.value = true;
  } else {
    showErrorNotification('No hay transacciones para exportar con los filtros actuales.');
  }
}

async function confirmExport() {
  /*const dataToExport = filteredTransactions.value.map((tx) => ({
    fecha: formatDate(tx.date),
    tipo: tx.type === 'sale' ? 'Venta' : 'Gasto',
    nombre: tx.name,
    cantidad: tx.quantity,
    costo_unitario: tx.unitCost,
    precio_venta_unitario: tx.type === 'sale' ? tx.unitPrice : '',
    ganancia: tx.type === 'sale' ? tx.profit : '',
    total: tx.total,
  }));

  const worksheet = utils.json_to_sheet(dataToExport);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Historial de Transacciones');
  writeFile(workbook, 'HistorialTransacciones.xlsx');*/
  const dataToExport = filteredTransactions.value.map((tx) => ({
    fecha: formatDate(tx.date),
    tipo: tx.type === 'sale' ? 'Venta' : 'Gasto',
    nombre: tx.name,
    cantidad: tx.quantity,
    costo_unitario: tx.unitCost,
    precio_venta_unitario: tx.type === 'sale' ? tx.unitPrice : '',
    ganancia: tx.type === 'sale' ? tx.profit : '',
    total: tx.total,
  }));
  void (await exportUtil({ data: dataToExport, fileName: 'HistorialTransacciones' }));
  isConfirmExportVisible.value = false;
}

// --- FORMATEADORES ---
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

// --- COLUMNAS DE LA TABLA ---
const columns: QTableProps['columns'] = [
  {
    name: 'date',
    label: 'Fecha',
    field: 'date',
    format: formatDate,
    sortable: true,
    align: 'left',
  },
  { name: 'type', label: 'Tipo', field: 'type', sortable: true, align: 'center' },
  {
    name: 'name',
    label: 'Nombre',
    field: 'name',
    sortable: true,
    align: 'left',
    style: 'width: 300px',
  },
  { name: 'quantity', label: 'Cant.', field: 'quantity', sortable: true, align: 'center' },
  { name: 'profit', label: 'Ganancia', field: 'profit', sortable: true, align: 'right' },
  { name: 'total', label: 'Monto Total', field: 'total', sortable: true, align: 'right' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
];
</script>
