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
            placeholder="Buscar producto..."
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
              label="Añadir Producto"
              color="secondary"
              icon="add"
              @click="openProductForm()"
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
                  :disable="products.length === 0"
                >
                  <q-item-section avatar><q-icon name="download" /></q-item-section>
                  <q-item-section>Exportar Excel</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="openResetSalesDialog"
                  :disable="products.length === 0"
                >
                  <q-item-section avatar><q-icon name="restart_alt" /></q-item-section>
                  <q-item-section>Resetear Ventas</q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  @click="openClearConfirmDialog"
                  :disable="products.length === 0"
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
          Al cargar Excel, asegúrate de que tenga 4 columnas:
          <strong>nombre, cantidad, costo_total, precio_venta</strong>.
        </div>
      </q-card-section>
    </q-card>

    <q-table
      :rows="products"
      :columns="columns"
      row-key="id"
      :filter="searchTerm"
      :loading="isLoading"
      no-data-label="Aún no has cargado ningún inventario."
      loading-label="Cargando datos..."
      :grid="$q.screen.lt.md"
      card-container-class="justify-center"
      flat
      bordered
    >
      <template v-slot:top>
        <div class="col-12 row justify-between items-center">
          <div class="text-h6">Lista de Productos</div>
          <q-chip size="lg" icon="paid" color="positive" text-color="white">
            <span class="text-weight-light q-mr-xs">Ganancia Total:</span>
            <span class="text-weight-bold">{{ formatCurrency(totalProfit) }}</span>
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
                  @click="openProductForm(props.row)"
                />
                <q-btn
                  dense
                  round
                  flat
                  color="negative"
                  icon="delete"
                  @click="openDeleteProductDialog(props.row.id)"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-gutter-sm">
              <div class="row justify-between">
                <span class="text-caption text-grey">Costo Unitario:</span>
                <span class="text-weight-medium">{{
                  formatCurrency(props.row.costoUnitario)
                }}</span>
              </div>
              <div class="row justify-between">
                <span class="text-caption text-grey">Precio Venta:</span>
                <span class="text-weight-medium">{{
                  formatCurrency(props.row.precioVentaUnitario)
                }}</span>
              </div>
              <div class="row justify-between items-center">
                <span class="text-caption text-grey">Cant. Vendida:</span>
                <div class="row items-center no-wrap">
                  <q-btn
                    dense
                    round
                    flat
                    size="sm"
                    icon="remove"
                    @click="decrementSale(props.row.id)"
                  />
                  <q-input
                    v-if="props.row.id"
                    :model-value="String(props.row.cantidadVendida || 0)"
                    @update:model-value="(val) => updateSales(props.row.id, val)"
                    @keydown="onNumericInput"
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
                    @click="incrementSale(props.row.id)"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-section
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
              class="text-center"
            >
              <div class="text-subtitle1 text-positive text-weight-bold">
                Ganancia:
                {{
                  formatCurrency(
                    (props.row.precioVentaUnitario - props.row.costoUnitario) *
                      (props.row.cantidadVendida || 0),
                  )
                }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:body-cell-cantidadVendida="props">
        <q-td :props="props">
          <div class="row items-center no-wrap justify-center q-gutter-x-sm">
            <q-btn dense round flat size="sm" icon="remove" @click="decrementSale(props.row.id)" />
            <q-input
              v-if="props.row.id"
              :model-value="String(props.row.cantidadVendida || 0)"
              @update:model-value="(val) => updateSales(props.row.id, val)"
              @keydown="onNumericInput"
              type="text"
              inputmode="numeric"
              dense
              outlined
              style="width: 70px; text-align: center"
            />
            <q-btn dense round flat size="sm" icon="add" @click="incrementSale(props.row.id)" />
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-ganancia="props">
        <q-td :props="props" class="text-weight-bold">
          {{
            formatCurrency(
              (props.row.precioVentaUnitario - props.row.costoUnitario) *
                (props.row.cantidadVendida || 0),
            )
          }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn dense round flat color="primary" icon="edit" @click="openProductForm(props.row)" />
          <q-btn
            dense
            round
            flat
            color="grey-8"
            icon="restart_alt"
            @click="resetSingleSale(props.row.id)"
          />
          <q-btn
            dense
            round
            flat
            color="negative"
            icon="delete"
            @click="openDeleteProductDialog(props.row.id)"
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
        :disable="!hasSales"
        draggable
        @click="handleFabClick"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-tooltip>Guardar Venta</q-tooltip>
      </q-fab>
    </q-page-sticky>

    <q-dialog v-model="isFormDialogVisible" @hide="productToEdit = null">
      <ProductForm :product-to-edit="productToEdit" @save="handleProductSave" />
    </q-dialog>
    <q-dialog v-model="isConfirmClearDialogVisible"
      ><q-card
        ><q-card-section class="row items-center"
          ><q-avatar icon="warning" color="negative" text-color="white" /><span class="q-ml-sm"
            >¿Estás seguro de que quieres borrar todos los datos?</span
          ></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat label="Cancelar" color="primary" v-close-popup /><q-btn
            flat
            label="Borrar Todo"
            color="negative"
            @click="confirmClearData" /></q-card-actions></q-card
    ></q-dialog>
    <q-dialog v-model="isConfirmDeleteDialogVisible"
      ><q-card
        ><q-card-section class="row items-center"
          ><q-avatar icon="warning" color="negative" text-color="white" /><span class="q-ml-sm"
            >¿Estás seguro de que quieres eliminar este producto?</span
          ></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat label="Cancelar" color="primary" v-close-popup /><q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="confirmDeleteProduct" /></q-card-actions></q-card
    ></q-dialog>
    <q-dialog v-model="isConfirmResetDialogVisible"
      ><q-card
        ><q-card-section class="row items-center"
          ><q-avatar icon="restart_alt" color="primary" text-color="white" /><span class="q-ml-sm"
            >¿Estás seguro de que quieres resetear todas las ventas a cero?</span
          ></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat label="Cancelar" v-close-popup /><q-btn
            flat
            label="Resetear"
            color="primary"
            @click="confirmResetAllSales" /></q-card-actions></q-card
    ></q-dialog>

    <q-dialog v-model="isConfirmSaveSaleDialogVisible">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Confirmar Fecha de Venta</div>
          <p>
            Selecciona la fecha para registrar los productos vendidos. Después, las cantidades se
            resetearán.
          </p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <DatePicker v-model="saleDate" label="Fecha de Venta" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar Venta" color="accent" @click="confirmSaveSale" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { read, utils, writeFile } from 'xlsx';
import { useQuasar, type QTableProps } from 'quasar';
import ProductForm from 'src/components/ProductForm.vue';
import DatePicker from 'src/components/DatePicker.vue';
import { showSuccessNotification, showErrorNotification } from 'src/utils/notifications';
import { db } from 'src/utils/db';
import type { Product, Transaction } from 'src/types/models';

const $q = useQuasar();

interface RawExcelProduct {
  nombre: string;
  cantidadInventario: number;
  costoTotal: number;
  precioVentaUnitario: number;
}

// --- STATE ---
const products = ref<Product[]>([]);
const isLoading = ref<boolean>(true);
const searchTerm = ref<string>('');
const fileInput = ref<HTMLInputElement | null>(null);
const isFormDialogVisible = ref(false);
const productToEdit = ref<Product | null>(null);
const isConfirmClearDialogVisible = ref(false);
const isConfirmDeleteDialogVisible = ref(false);
const isConfirmResetDialogVisible = ref(false);
const isConfirmSaveSaleDialogVisible = ref(false);
const productToDeleteId = ref<number | null>(null);
const saleDate = ref<number>(Date.now());
const fabOpen = ref(false);
const fabPos = ref<[number, number]>([18, 18]);

// --- UTILITY FUNCTIONS ---
function onNumericInput(evt: KeyboardEvent) {
  if (
    !/^[0-9]$/.test(evt.key) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(evt.key)
  ) {
    evt.preventDefault();
  }
}

// --- DATABASE & CORE LOGIC ---
async function loadProductsFromDB(): Promise<void> {
  try {
    const allProducts = await db.products.toArray();
    products.value = allProducts.map((p) => ({ ...p, cantidadVendida: p.cantidadVendida || 0 }));
  } catch {
    showErrorNotification('Error al cargar productos.');
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadProductsFromDB();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const moveFab = (ev: any) => {
  if (ev.isFinal) {
    return;
  }
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y];
};

const updateSalesInDB = (() => {
  let timeout: ReturnType<typeof setTimeout>;
  return (productId: number, numericValue: number) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      void (async () => {
        try {
          await db.products.update(productId, { cantidadVendida: numericValue });
        } catch {
          showErrorNotification('No se pudo guardar la venta.');
        }
      })();
    }, 500);
  };
})();

function updateSales(productId: number | undefined, value: string | number | null) {
  if (typeof productId === 'undefined') return;
  const stringValue = String(value ?? '');
  const numericValue = parseInt(stringValue.replace(/\D/g, ''), 10) || 0;
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    product.cantidadVendida = numericValue;
    updateSalesInDB(productId, numericValue);
  }
}

function incrementSale(productId: number | undefined) {
  if (typeof productId === 'undefined') return;
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    const newValue = (product.cantidadVendida || 0) + 1;
    updateSales(productId, newValue);
  }
}

function decrementSale(productId: number | undefined) {
  if (typeof productId === 'undefined') return;
  const product = products.value.find((p) => p.id === productId);
  if (product && product.cantidadVendida && product.cantidadVendida > 0) {
    const newValue = product.cantidadVendida - 1;
    updateSales(productId, newValue);
  }
}

function resetSingleSale(productId: number | undefined) {
  if (typeof productId === 'undefined') return;
  updateSales(productId, 0);
  void db.products.update(productId, { cantidadVendida: 0 });
}

// --- FILE & FORM HANDLING ---
function triggerFileInput() {
  fileInput.value?.click();
}

function openProductForm(product: Product | null = null) {
  productToEdit.value = product;
  isFormDialogVisible.value = true;
}

async function handleProductSave(productData: Product) {
  try {
    if (productData.id) {
      await db.products.update(productData.id, productData);
      showSuccessNotification('Producto actualizado con éxito.');
    } else {
      await db.products.add({ ...productData, cantidadVendida: 0 });
      showSuccessNotification('Producto guardado con éxito.');
    }
    await loadProductsFromDB();
    isFormDialogVisible.value = false;
  } catch {
    showErrorNotification('Error al guardar el producto.');
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

      const jsonRawProducts: RawExcelProduct[] = utils.sheet_to_json<RawExcelProduct>(worksheet, {
        header: ['nombre', 'cantidadInventario', 'costoTotal', 'precioVentaUnitario'],
        range: 1,
      });

      const productsToSave: Product[] = jsonRawProducts.map((raw) => ({
        nombre: raw.nombre,
        cantidadInventario: raw.cantidadInventario,
        precioVentaUnitario: raw.precioVentaUnitario,
        costoUnitario:
          raw.cantidadInventario > 0 && typeof raw.costoTotal === 'number'
            ? raw.costoTotal / raw.cantidadInventario
            : 0,
        cantidadVendida: 0,
      }));

      await db.products.bulkAdd(productsToSave);
      await loadProductsFromDB();
      showSuccessNotification(`Éxito: ${productsToSave.length} productos cargados.`);
    } catch (error) {
      showErrorNotification(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`);
    } finally {
      isLoading.value = false;
      if (target) target.value = '';
    }
  };
  reader.readAsArrayBuffer(file);
}

// --- DIALOG CONFIRMATIONS ---
function openClearConfirmDialog() {
  isConfirmClearDialogVisible.value = true;
}
async function confirmClearData() {
  try {
    await db.products.clear();
    await loadProductsFromDB();
    showSuccessNotification('Todos los datos han sido borrados.');
  } catch {
    showErrorNotification('Error al borrar los datos.');
  } finally {
    isConfirmClearDialogVisible.value = false;
  }
}

function openDeleteProductDialog(id: number | undefined) {
  if (typeof id === 'number') {
    productToDeleteId.value = id;
    isConfirmDeleteDialogVisible.value = true;
  }
}
async function confirmDeleteProduct() {
  if (productToDeleteId.value === null) return;
  try {
    await db.products.delete(productToDeleteId.value);
    await loadProductsFromDB();
    showSuccessNotification('Producto eliminado con éxito.');
  } catch {
    showErrorNotification('Error al eliminar el producto.');
  } finally {
    isConfirmDeleteDialogVisible.value = false;
    productToDeleteId.value = null;
  }
}

function openResetSalesDialog() {
  isConfirmResetDialogVisible.value = true;
}
async function confirmResetAllSales() {
  try {
    const updatedProducts = products.value.map((p) => ({ ...p, cantidadVendida: 0 }));
    await db.products.bulkPut(updatedProducts);
    await loadProductsFromDB();
    showSuccessNotification('Todas las ventas han sido reseteadas.');
  } catch {
    showErrorNotification('Error al resetear las ventas.');
  } finally {
    isConfirmResetDialogVisible.value = false;
  }
}

function handleFabClick() {
  if (hasSales.value) {
    openSaveSaleDialog();
  }
}

function openSaveSaleDialog() {
  saleDate.value = Date.now();
  isConfirmSaveSaleDialogVisible.value = true;
}
async function confirmSaveSale() {
  const productsToRecord = products.value.filter((p) => p.cantidadVendida && p.cantidadVendida > 0);
  if (productsToRecord.length === 0) {
    showErrorNotification('No hay ventas para guardar.');
    isConfirmSaveSaleDialogVisible.value = false;
    return;
  }

  const newTransactions: Transaction[] = productsToRecord.map((p) => ({
    type: 'sale',
    date: saleDate.value,
    name: p.nombre,
    quantity: p.cantidadVendida!,
    unitCost: p.costoUnitario,
    unitPrice: p.precioVentaUnitario,
    profit: (p.precioVentaUnitario - p.costoUnitario) * p.cantidadVendida!,
    total: p.precioVentaUnitario * p.cantidadVendida!,
  }));

  try {
    await db.transactions.bulkAdd(newTransactions);
    await confirmResetAllSales();
    showSuccessNotification('Ventas guardadas con éxito en el historial.');
  } catch {
    showErrorNotification('Error al guardar las ventas.');
  } finally {
    isConfirmSaveSaleDialogVisible.value = false;
  }
}

// --- EXPORT & COMPUTEDS ---
const hasSales = computed(() =>
  products.value.some((p) => p.cantidadVendida && p.cantidadVendida > 0),
);

function exportToExcel() {
  if (products.value.length === 0) {
    showErrorNotification('No hay productos para exportar.');
    return;
  }
  const dataToExport = products.value.map((p) => ({
    nombre: p.nombre,
    cantidad: p.cantidadInventario,
    costo_total: p.costoUnitario * p.cantidadInventario,
    precio_venta: p.precioVentaUnitario,
    cantidad_vendida: p.cantidadVendida || 0,
    ganancia_calculada: (p.precioVentaUnitario - p.costoUnitario) * (p.cantidadVendida || 0),
  }));
  const worksheet = utils.json_to_sheet(dataToExport);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Reporte de Ganancias');
  writeFile(workbook, 'ReporteGanancias.xlsx');
  showSuccessNotification('Reporte exportado con éxito.');
}

const totalProfit = computed<number>(() => {
  return products.value.reduce(
    (total, p) => total + (p.precioVentaUnitario - p.costoUnitario) * (p.cantidadVendida || 0),
    0,
  );
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const columns: QTableProps['columns'] = [
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'costoUnitario',
    label: 'Costo Unit.',
    field: 'costoUnitario',
    format: (val: number) => formatCurrency(val),
    sortable: true,
  },
  {
    name: 'precioVentaUnitario',
    label: 'Precio Venta Unit.',
    field: 'precioVentaUnitario',
    format: (val: number) => formatCurrency(val),
    sortable: true,
  },
  { name: 'cantidadVendida', label: 'Cantidad Vendida', field: 'cantidadVendida', align: 'center' },
  { name: 'ganancia', label: 'Ganancia', field: 'ganancia', align: 'right', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' },
];
watch(
  () => isConfirmSaveSaleDialogVisible.value,
  (value) => {
    if (!value) {
      fabOpen.value = false;
    }
  },
);
</script>

<style>
.hidden {
  display: none;
}
</style>
