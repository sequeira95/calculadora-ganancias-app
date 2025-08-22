<template>
  <q-card style="width: 400px; max-width: 90vw">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">{{ isEditing ? 'Editar Gasto' : 'Añadir Nuevo Gasto' }}</div>
    </q-card-section>

    <q-form @submit.prevent="submitForm" lazy-rules>
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="expenseData.nombre"
          label="Nombre del Gasto"
          outlined
          dense
          :rules="[(val) => !!val || 'El nombre es requerido']"
          autofocus
        />
        <NumericInput
          v-model="expenseData.valor"
          label="Valor del Gasto"
          format="currency"
          :rules="[
            (val: string) =>
              (val && parseInt(val.replace(/\D/g, '')) > 0) || 'El valor debe ser mayor a 0',
          ]"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" color="grey" flat v-close-popup />
        <q-btn label="Guardar Gasto" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Expense } from 'src/types/models';
import NumericInput from 'src/components/NumericInput.vue';

interface Props {
  expenseToEdit?: Expense | null;
}
const props = defineProps<Props>();

const emit = defineEmits<(e: 'save', payload: Expense) => void>();

const expenseData = ref<Omit<Expense, 'id'>>({
  nombre: '',
  valor: 0,
});

const isEditing = computed(() => !!props.expenseToEdit);

watch(
  () => props.expenseToEdit,
  (newExpense) => {
    if (newExpense) {
      expenseData.value = { ...newExpense };
    } else {
      expenseData.value = {
        nombre: '',
        valor: 0,
      };
    }
  },
  { immediate: true },
);

function submitForm() {
  const finalExpense: Expense = {
    ...(props.expenseToEdit?.id && { id: props.expenseToEdit.id }),
    ...expenseData.value,
  };
  emit('save', finalExpense);
}
</script>
