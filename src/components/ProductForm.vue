<template>
  <q-card style="width: 400px; max-width: 90vw">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">{{ isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</div>
    </q-card-section>

    <q-form @submit.prevent="submitForm">
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="productData.nombre"
          label="Nombre del Producto"
          outlined
          dense
          :rules="[(val) => !!val || 'El nombre es requerido']"
          autofocus
        />
        <q-input
          v-model="cantidadModel"
          label="Cantidad en Inventario"
          type="text"
          inputmode="numeric"
          @keydown="onNumericInput"
          outlined
          dense
          :rules="[
            (val) => (/^\d+$/.test(val) && parseInt(val) > 0) || 'La cantidad debe ser mayor a 0',
          ]"
        />
        <q-input
          v-model="costoTotalModel"
          label="Costo Total"
          type="text"
          inputmode="numeric"
          @keydown="onNumericInput"
          @focus="moveCursorToEnd"
          outlined
          dense
          :rules="[(val) => !!val || 'El costo es requerido']"
          input-class="text-right"
        />
        <q-input
          v-model="precioVentaModel"
          label="Precio de Venta Unitario"
          type="text"
          inputmode="numeric"
          @keydown="onNumericInput"
          @focus="moveCursorToEnd"
          outlined
          dense
          :rules="[(val) => !!val || 'El precio es requerido']"
          input-class="text-right"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" color="grey" flat v-close-popup />
        <q-btn label="Guardar Producto" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Product } from 'src/types/models';

interface Props {
  productToEdit?: Product | null; // Acepta Product o null
}
const props = defineProps<Props>();

const emit = defineEmits<(e: 'save', payload: Product) => void>();

const productData = ref({
  id: undefined as number | undefined,
  nombre: '',
  cantidadInventario: 0,
  costoTotal: 0,
  precioVentaUnitario: 0,
});

const isEditing = computed(() => !!props.productToEdit);

watch(
  () => props.productToEdit,
  (newProduct) => {
    if (newProduct) {
      productData.value = {
        id: newProduct.id,
        nombre: newProduct.nombre,
        cantidadInventario: newProduct.cantidadInventario,
        costoTotal: newProduct.costoUnitario * newProduct.cantidadInventario,
        precioVentaUnitario: newProduct.precioVentaUnitario,
      };
    } else {
      productData.value = {
        id: undefined,
        nombre: '',
        cantidadInventario: 0,
        costoTotal: 0,
        precioVentaUnitario: 0,
      };
    }
  },
  { immediate: true },
);

// --- KEYDOWN HANDLERS ---
function onNumericInput(evt: KeyboardEvent) {
  if (
    !/^[0-9]$/.test(evt.key) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(evt.key)
  ) {
    evt.preventDefault();
  }
}

// --- CURSOR MANAGEMENT ---
function moveCursorToEnd(evt: Event) {
  const target = evt.target as HTMLInputElement;
  // Usamos setTimeout con 0ms para asegurar que esta acción se ejecute
  // después de que Vue haya terminado de actualizar el DOM.
  setTimeout(() => {
    target.setSelectionRange(target.value.length, target.value.length);
  }, 0);
}

// --- COMPUTED MODELS ---
const cantidadModel = computed({
  get: () => String(productData.value.cantidadInventario),
  set: (newValue) => {
    const digitsOnly = String(newValue).replace(/\D/g, '');
    productData.value.cantidadInventario = parseInt(digitsOnly, 10) || 0;
  },
});

function createCurrencyModel(key: 'costoTotal' | 'precioVentaUnitario') {
  return computed({
    get: () => {
      return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(productData.value[key]);
    },
    set: (newValue: string) => {
      const digitsOnly = String(newValue).replace(/\D/g, '');
      const numberValue = parseInt(digitsOnly, 10) || 0;
      productData.value[key] = numberValue / 100;
    },
  });
}

const costoTotalModel = createCurrencyModel('costoTotal');
const precioVentaModel = createCurrencyModel('precioVentaUnitario');

function submitForm() {
  const { id, nombre, cantidadInventario, costoTotal, precioVentaUnitario } = productData.value;
  const costoUnitario = cantidadInventario > 0 ? costoTotal / cantidadInventario : 0;

  const finalProduct: Product = {
    ...(id !== undefined && { id }),
    nombre,
    cantidadInventario,
    costoUnitario,
    precioVentaUnitario,
  };
  emit('save', finalProduct);
}
</script>
