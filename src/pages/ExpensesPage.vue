<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md" flat>
      <q-card-section class="row justify-between items-center q-gutter-y-md">
        <div class="col-12 col-md-4">
          <q-input
            outlined
            dense
            debounce="300"
            v-model="searchTerm"
            placeholder="Buscar gasto..."
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-auto row justify-end">
          <div :class="['q-gutter-sm', $q.screen.lt.sm ? 'column full-width' : 'row']">
            <q-btn
              :class="{ 'full-width': $q.screen.lt.sm }"
              label="Cargar Excel"
              color="primary"
              icon="upload_file"
              @click="triggerFileInput"
            />
            <q-btn
              :class="{ 'full-width': $q.screen.lt.sm }"
              label="Añadir Gasto"
              color="secondary"
              icon="add"
              @click="openExpenseForm()"
            />
            <q-btn-dropdown
              :class="{ 'full-width': $q.screen.lt.sm }"
              color="grey-7"
              icon="more_vert"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="exportToExcel"
                  :disable="expenses.length === 0"
                >
                  <q-item-section avatar><q-icon name="download" /></q-item-section>
                  <q-item-section>Exportar Excel</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="openResetQuantitiesDialog"
                  :disable="expenses.length === 0"
                >
                  <q-item-section avatar><q-icon name="restart_alt" /></q-item-section>
                  <q-item-section>Resetear Cantidades</q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  @click="openClearConfirmDialog"
                  :disable="expenses.length === 0"
                >
                  <q-item-section avatar
                    ><q-icon name="delete_sweep" color="negative"
                  /></q-item-section>
                  <q-item-section>Borrar Todo</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              class="hidden"
              accept=".xlsx, .xls"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="text-caption text-grey-7">
          Al cargar Excel, asegúrate de que tenga 2 columnas: <strong>nombre, valor</strong>.
        </div>
      </q-card-section>
    </q-card>

    <q-table
      :rows="expenses"
      :columns="columns"
      row-key="id"
      :filter="searchTerm"
      :loading="isLoading"
      no-data-label="Aún no has añadido ningún gasto."
      loading-label="Cargando datos..."
      :grid="$q.screen.lt.md"
      card-container-class="justify-center"
      flat
      bordered
    >
      <template v-slot:top>
        <div class="col-12 row justify-between items-center">
          <div class="text-h6">Lista de Gastos</div>
          <q-chip size="lg" icon="receipt_long" color="negative" text-color="white">
            <span class="text-weight-light q-mr-xs">Gasto Total:</span>
            <span class="text-weight-bold">{{ formatCurrency(totalExpenses) }}</span>
          </q-chip>
        </div>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card bordered flat :dark="$q.dark.isActive">
            <q-card-section class="row items-center justify-between">
              <div class="text-h6 text-grey-8">{{ props.row.nombre }}</div>
              <div>
                <q-btn
                  dense
                  round
                  flat
                  color="primary"
                  icon="edit"
                  @click="openExpenseForm(props.row)"
                />
                <q-btn
                  dense
                  round
                  flat
                  color="negative"
                  icon="delete"
                  @click="openDeleteExpenseDialog(props.row.id)"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-gutter-sm">
              <div class="row justify-between">
                <span class="text-caption text-grey">Valor Unitario:</span>
                <span class="text-weight-medium">{{ formatCurrency(props.row.valor) }}</span>
              </div>
              <div class="row justify-between items-center">
                <span class="text-caption text-grey">Cantidad:</span>
                <div class="row items-center no-wrap">
                  <q-btn
                    dense
                    round
                    flat
                    size="sm"
                    icon="remove"
                    @click="decrementQuantity(props.row.id)"
                  />
                  <q-input
                    v-if="props.row.id"
                    :model-value="String(props.row.cantidad || 0)"
                    @update:model-value="(val) => updateQuantity(props.row.id, val)"
                    type="text"
                    inputmode="numeric"
                    dense
                    outlined
                    style="width: 70px"
                    input-class="text-center"
                    class="q-mx-xs"
                  />
                  <q-btn
                    dense
                    round
                    flat
                    size="sm"
                    icon="add"
                    @click="incrementQuantity(props.row.id)"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row justify-between items-center">
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  :icon="props.row.showComment ? 'expand_less' : 'comment'"
                  :label="props.row.comment ? 'Editar Comentario' : 'Añadir Comentario'"
                  @click="props.row.showComment = !props.row.showComment"
                />
              </div>
              <q-slide-transition>
                <div v-show="props.row.showComment">
                  <q-input
                    v-model="props.row.comment"
                    @update:model-value="(val) => updateComment(props.row.id, val)"
                    outlined
                    dense
                    type="textarea"
                    label="Comentario"
                    rows="2"
                    class="q-mt-sm"
                  />
                </div>
              </q-slide-transition>
            </q-card-section>
            <q-card-section
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
              class="text-center"
            >
              <div class="text-subtitle1 text-negative text-weight-bold">
                Total: {{ formatCurrency(props.row.valor * (props.row.cantidad || 0)) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          <div class="row items-center no-wrap justify-center q-gutter-x-sm">
            <q-btn
              dense
              round
              flat
              size="sm"
              icon="remove"
              @click="decrementQuantity(props.row.id)"
            />
            <q-input
              v-if="props.row.id"
              :model-value="String(props.row.cantidad || 0)"
              @update:model-value="(val) => updateQuantity(props.row.id, val)"
              type="text"
              inputmode="numeric"
              dense
              outlined
              style="width: 70px; text-align: center"
            />
            <q-btn dense round flat size="sm" icon="add" @click="incrementQuantity(props.row.id)" />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-comment="props">
        <q-td :props="props">
          <q-input
            :model-value="props.row.comment"
            @update:model-value="(val) => updateComment(props.row.id, val)"
            dense
            borderless
            placeholder="Escribir..."
            input-style="min-width: 150px"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="text-weight-bold">
          {{ formatCurrency(props.row.valor * (props.row.cantidad || 0)) }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn dense round flat color="primary" icon="edit" @click="openExpenseForm(props.row)" />
          <q-btn
            dense
            round
            flat
            color="grey-8"
            icon="restart_alt"
            @click="resetSingleQuantity(props.row.id)"
          />
          <q-btn
            dense
            round
            flat
            color="negative"
            icon="delete"
            @click="openDeleteExpenseDialog(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <q-page-sticky position="bottom-right" :offset="fabPos">
      <q-fab
        v-model="fabOpen"
        icon="save"
        color="accent"
        direction="up"
        :disable="!hasQuantities"
        draggable
        @click="handleFabClick"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-tooltip>Guardar Gastos</q-tooltip>
      </q-fab>
    </q-page-sticky>

    <q-dialog v-model="isFormDialogVisible" @hide="expenseToEdit = null">
      <ExpenseForm :expense-to-edit="expenseToEdit" @save="handleExpenseSave" />
    </q-dialog>
    <q-dialog v-model="isConfirmClearDialogVisible">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que quieres borrar todos los gastos?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Borrar Todo" color="negative" @click="confirmClearData" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isConfirmDeleteDialogVisible">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que quieres eliminar este gasto?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="confirmDeleteExpense" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isConfirmResetDialogVisible">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="restart_alt" color="primary" text-color="white" />
          <span class="q-ml-sm"
            >¿Estás seguro de que quieres resetear todas las cantidades a cero?</span
          >
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Resetear" color="primary" @click="confirmResetAllQuantities" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isConfirmSaveDialogVisible">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Confirmar Fecha de Gastos</div>
          <p>
            Selecciona la fecha para registrar los gastos. Después, las cantidades se resetearán.
          </p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <DatePicker v-model="expenseDate" label="Fecha del Gasto" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar Gastos" color="accent" @click="confirmSaveExpense" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { read, utils } from 'xlsx';
import { useQuasar, type QTableProps } from 'quasar';
import ExpenseForm from 'src/components/ExpenseForm.vue';
import DatePicker from 'src/components/DatePicker.vue';
import { showSuccessNotification, showErrorNotification } from 'src/utils/notifications';
import { db } from 'src/utils/db';
import type { Expense, Transaction } from 'src/types/models';
import { exportToExcel as exportUtil } from 'src/utils/excelExporter';

const $q = useQuasar();

// --- TIPOS Y UTILIDADES ---
interface RawExcelExpense {
  nombre: string;
  valor: number;
}

interface ExpenseWithUI extends Expense {
  showComment?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

interface DebouncedFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  flush: () => void;
}

function debounce<T extends AnyFunction>(func: T, delay: number): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout>;

  const debounced = function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  } as DebouncedFunction<T>;

  debounced.flush = function () {
    clearTimeout(timeout);
  };

  return debounced;
}

// --- ESTADO ---
const expenses = ref<ExpenseWithUI[]>([]);
const isLoading = ref(true);
const searchTerm = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const isFormDialogVisible = ref(false);
const expenseToEdit = ref<Expense | null>(null);
const isConfirmClearDialogVisible = ref(false);
const isConfirmDeleteDialogVisible = ref(false);
const isConfirmResetDialogVisible = ref(false);
const expenseToDeleteId = ref<number | null>(null);
const expenseDate = ref<number>(Date.now());
const isConfirmSaveDialogVisible = ref(false);
const fabOpen = ref(false);
const fabPos = ref<[number, number]>([18, 18]);

// --- LÓGICA DE BASE DE DATOS Y CANTIDADES ---
async function loadExpensesFromDB() {
  isLoading.value = true;
  try {
    const allExpenses = await db.expenses.toArray();
    expenses.value = allExpenses.map((e) => ({
      ...e,
      cantidad: e.cantidad || 0,
      comment: e.comment || '',
    }));
  } catch {
    showErrorNotification('Error al cargar los gastos.');
  } finally {
    isLoading.value = false;
  }
}
onMounted(loadExpensesFromDB);

const updateQuantityInDB = debounce(async (expenseId: number, numericValue: number) => {
  try {
    await db.expenses.update(expenseId, { cantidad: numericValue });
  } catch {
    showErrorNotification('No se pudo guardar la cantidad.');
  }
}, 500);

const updateCommentInDB = debounce(async (expenseId: number, comment: string) => {
  try {
    await db.expenses.update(expenseId, { comment });
  } catch {
    showErrorNotification('No se pudo guardar el comentario.');
  }
}, 500);

function updateQuantity(expenseId: number | undefined, value: string | number | null) {
  if (typeof expenseId === 'undefined') return;
  const stringValue = String(value ?? '');
  const numericValue = parseInt(stringValue.replace(/\D/g, ''), 10) || 0;
  const expense = expenses.value.find((e) => e.id === expenseId);
  if (expense) {
    expense.cantidad = numericValue;
    updateQuantityInDB(expenseId, numericValue);
  }
}

function updateComment(expenseId: number | undefined, value: string | number | null) {
  if (typeof expenseId === 'undefined') return;
  const comment = String(value ?? '');
  const expense = expenses.value.find((e) => e.id === expenseId);
  if (expense) {
    expense.comment = comment;
    updateCommentInDB(expenseId, comment);
  }
}

function incrementQuantity(expenseId: number | undefined) {
  if (typeof expenseId === 'undefined') return;
  const expense = expenses.value.find((e) => e.id === expenseId);
  if (expense) {
    const newValue = (expense.cantidad || 0) + 1;
    updateQuantity(expenseId, newValue);
  }
}

function decrementQuantity(expenseId: number | undefined) {
  if (typeof expenseId === 'undefined') return;
  const expense = expenses.value.find((e) => e.id === expenseId);
  if (expense && expense.cantidad && expense.cantidad > 0) {
    const newValue = expense.cantidad - 1;
    updateQuantity(expenseId, newValue);
  }
}

function resetSingleQuantity(expenseId: number | undefined) {
  if (typeof expenseId === 'undefined') return;
  updateQuantity(expenseId, 0);
  updateComment(expenseId, '');
  updateQuantityInDB.flush();
  updateCommentInDB.flush();
  void db.expenses.update(expenseId, { cantidad: 0, comment: '' });
}

// --- MANEJO DE ARCHIVOS Y FORMULARIO ---
function triggerFileInput() {
  fileInput.value?.click();
}

function openExpenseForm(expense: Expense | null = null) {
  expenseToEdit.value = expense;
  isFormDialogVisible.value = true;
}

async function handleExpenseSave(expenseData: Expense) {
  try {
    if (expenseData.id) {
      await db.expenses.update(expenseData.id, expenseData);
      showSuccessNotification('Gasto actualizado con éxito.');
    } else {
      await db.expenses.add({ ...expenseData, cantidad: 0, comment: '' });
      showSuccessNotification('Gasto guardado con éxito.');
    }
    await loadExpensesFromDB();
    isFormDialogVisible.value = false;
  } catch {
    showErrorNotification('Error al guardar el gasto.');
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  isLoading.value = true;
  const reader = new FileReader();
  reader.onload = async (e: ProgressEvent<FileReader>) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('El archivo Excel no contiene hojas.');
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) throw new Error(`La hoja '${sheetName}' no se encontró.`);

      const jsonRawExpenses: RawExcelExpense[] = utils.sheet_to_json<RawExcelExpense>(worksheet, {
        header: ['nombre', 'valor'],
        range: 1,
      });

      const expensesToSave: Omit<Expense, 'id'>[] = jsonRawExpenses.map((raw) => ({
        nombre: raw.nombre,
        valor: raw.valor,
        cantidad: 0,
        comment: '',
      }));

      await db.expenses.bulkAdd(expensesToSave as Expense[]);
      await loadExpensesFromDB();
      showSuccessNotification(`Éxito: ${expensesToSave.length} gastos cargados.`);
    } catch (error) {
      showErrorNotification(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`);
    } finally {
      isLoading.value = false;
      if (target) target.value = '';
    }
  };
  reader.readAsArrayBuffer(file);
}

// --- DIÁLOGOS DE CONFIRMACIÓN ---
function openClearConfirmDialog() {
  isConfirmClearDialogVisible.value = true;
}
async function confirmClearData() {
  try {
    await db.expenses.clear();
    await loadExpensesFromDB();
    showSuccessNotification('Todos los gastos han sido borrados.');
  } catch {
    showErrorNotification('Error al borrar los gastos.');
  } finally {
    isConfirmClearDialogVisible.value = false;
  }
}

function openDeleteExpenseDialog(id: number | undefined) {
  if (typeof id === 'number') {
    expenseToDeleteId.value = id;
    isConfirmDeleteDialogVisible.value = true;
  }
}
async function confirmDeleteExpense() {
  if (expenseToDeleteId.value === null) return;
  try {
    await db.expenses.delete(expenseToDeleteId.value);
    await loadExpensesFromDB();
    showSuccessNotification('Gasto eliminado con éxito.');
  } catch {
    showErrorNotification('Error al eliminar el gasto.');
  } finally {
    isConfirmDeleteDialogVisible.value = false;
    expenseToDeleteId.value = null;
  }
}

function openResetQuantitiesDialog() {
  isConfirmResetDialogVisible.value = true;
}
async function confirmResetAllQuantities() {
  try {
    const updatedExpenses = expenses.value.map((e) => ({ ...e, cantidad: 0, comment: '' }));
    await db.expenses.bulkPut(updatedExpenses);
    await loadExpensesFromDB();
    showSuccessNotification('Todas las cantidades han sido reseteadas.');
  } catch {
    showErrorNotification('Error al resetear las cantidades.');
  } finally {
    isConfirmResetDialogVisible.value = false;
  }
}

// --- LÓGICA DEL BOTÓN FLOTANTE (FAB) Y GUARDADO ---
const hasQuantities = computed(() => expenses.value.some((e) => e.cantidad && e.cantidad > 0));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const moveFab = (ev: any) => {
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y];
};

function handleFabClick() {
  if (hasQuantities.value) {
    expenseDate.value = Date.now();
    isConfirmSaveDialogVisible.value = true;
  }
}

async function confirmSaveExpense() {
  const expensesToRecord = expenses.value.filter((e) => e.cantidad && e.cantidad > 0);
  if (expensesToRecord.length === 0) {
    showErrorNotification('No hay gastos para guardar.');
    isConfirmSaveDialogVisible.value = false;
    return;
  }

  const newTransactions: Transaction[] = expensesToRecord.map((e) => ({
    type: 'expense',
    date: expenseDate.value,
    name: e.nombre,
    quantity: e.cantidad!,
    unitCost: e.valor,
    total: -Math.abs(e.valor * e.cantidad!),
    ...(e.comment ? { comment: e.comment } : {}),
  }));

  try {
    await db.transactions.bulkAdd(newTransactions);
    await confirmResetAllQuantities();
    showSuccessNotification('Gastos guardados con éxito en el historial.');
  } catch {
    showErrorNotification('Error al guardar los gastos.');
  } finally {
    isConfirmSaveDialogVisible.value = false;
  }
}

// --- EXPORTACIÓN Y COMPUTADAS ---
/*function exportToExcel() {
  if (expenses.value.length === 0) {
    showErrorNotification('No hay gastos para exportar.');
    return;
  }
  const dataToExport = expenses.value.map((e) => ({
    nombre: e.nombre,
    valor_unitario: e.valor,
    cantidad: e.cantidad || 0,
    total_gasto: e.valor * (e.cantidad || 0),
  }));
  const worksheet = utils.json_to_sheet(dataToExport);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Reporte de Gastos');
  writeFile(workbook, 'ReporteGastos.xlsx');
  showSuccessNotification('Reporte exportado con éxito.');
}*/
async function exportToExcel() {
  if (expenses.value.length === 0) {
    showErrorNotification('No hay gastos para exportar.');
    return;
  }
  const dataToExport = expenses.value.map((e) => ({
    nombre: e.nombre,
    valor_unitario: e.valor,
    cantidad: e.cantidad || 0,
    total_gasto: e.valor * (e.cantidad || 0),
  }));
  void (await exportUtil({ data: dataToExport, fileName: 'ReporteGastos' }));
}

const totalExpenses = computed<number>(() => {
  return expenses.value.reduce((total, e) => total + e.valor * (e.cantidad || 0), 0);
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// --- COLUMNAS DE LA TABLA ---
const columns: QTableProps['columns'] = [
  { name: 'nombre', label: 'Gasto', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'valor',
    label: 'Valor Unitario',
    field: 'valor',
    format: formatCurrency,
    align: 'right',
    sortable: true,
  },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'comment', label: 'Comentario', field: 'comment', align: 'left' },
  { name: 'total', label: 'Total', field: 'total', align: 'right', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' },
];
</script>

<style>
.hidden {
  display: none;
}
</style>
