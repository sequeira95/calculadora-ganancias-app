<template>
  <q-card style="width: 400px; max-width: 90vw">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">{{ isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</div>
    </q-card-section>

    <q-form @submit.prevent="submitForm" lazy-rules>
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="productData.nombre"
          label="Nombre del Producto"
          outlined
          dense
          :rules="[(val) => !!val || 'El nombre es requerido']"
          autofocus
        />
        <q-checkbox v-model="productData.isCustom" label="Producto Personalizado" />
        <NumericInput
          v-model="productData.cantidadInventario"
          label="Cantidad en Inventario"
          format="integer"
          :rules="[(val: string) => (val && parseInt(val) > 0) || 'La cantidad debe ser mayor a 0']"
        />
        <NumericInput
          v-model="productData.costoTotal"
          label="Costo Total"
          format="currency"
          :rules="[
            (val: string) =>
              productData.isCustom ||
              (val && parseInt(val.replace(/\D/g, '')) > 0) ||
              'El costo debe ser mayor a 0',
          ]"
        />
        <NumericInput
          v-model="productData.precioVentaUnitario"
          label="Precio de Venta Unitario"
          format="currency"
          :rules="[
            (val: string) =>
              (val && parseInt(val.replace(/\D/g, '')) > 0) || 'El precio debe ser mayor a 0',
          ]"
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
import NumericInput from 'src/components/NumericInput.vue';

interface Props {
  productToEdit?: Product | null;
}
const props = defineProps<Props>();

const emit = defineEmits<(e: 'save', payload: Product) => void>();

const productData = ref({
  id: undefined as number | undefined,
  nombre: '',
  cantidadInventario: 0,
  costoTotal: 0,
  precioVentaUnitario: 0,
  isCustom: false,
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
        isCustom: newProduct.isCustom || false,
      };
    } else {
      productData.value = {
        id: undefined,
        nombre: '',
        cantidadInventario: 0,
        costoTotal: 0,
        precioVentaUnitario: 0,
        isCustom: false,
      };
    }
  },
  { immediate: true },
);

function submitForm() {
  const { id, nombre, cantidadInventario, costoTotal, precioVentaUnitario, isCustom } =
    productData.value;
  const costoUnitario = cantidadInventario > 0 ? costoTotal / cantidadInventario : 0;

  const finalProduct: Product = {
    ...(id !== undefined && { id }),
    nombre,
    cantidadInventario,
    costoUnitario,
    precioVentaUnitario,
    isCustom,
  };
  emit('save', finalProduct);
}
</script>
