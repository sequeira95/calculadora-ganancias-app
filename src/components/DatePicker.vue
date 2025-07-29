<template>
  <q-input
    filled
    v-model="displayDate"
    :label="label"
    mask="##/##/####"
    :rules="[isValidDate]"
    placeholder="DD/MM/YYYY"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
          <q-date :model-value="calendarDate" @update:model-value="updateFromCalendar" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { date, QPopupProxy } from 'quasar';
const qDateProxy = ref<QPopupProxy | null>(null);
const props = defineProps<{
  modelValue: number | null; // El valor que recibimos es un timestamp o null
  label: string;
}>();

const emit = defineEmits(['update:modelValue']);

// Propiedad computada para manejar el v-model del q-input
const displayDate = computed({
  // GET: Convierte el timestamp del padre a un string DD/MM/YYYY para mostrarlo
  get: () => {
    return props.modelValue ? date.formatDate(props.modelValue, 'DD/MM/YYYY') : '';
  },
  // SET: Se activa cuando el usuario escribe en el input
  set: (value: string) => {
    // Solo actualiza si la fecha está completa y es válida, o si el valor está vacío
    if (value && value.length === 10 && isValidDate(value) === true) {
      const newTimestamp = date.extractDate(value, 'DD/MM/YYYY').getTime();
      emit('update:modelValue', newTimestamp);
    } else if (!value) {
      // Permite borrar la fecha
      emit('update:modelValue', null);
    }
  },
});

// Propiedad computada para el v-model del q-date (necesita formato YYYY/MM/DD)
const calendarDate = computed(() => {
  return props.modelValue ? date.formatDate(props.modelValue, 'YYYY/MM/DD') : '';
});

// Se activa cuando el usuario selecciona una fecha en el calendario
function updateFromCalendar(value: string) {
  console.log({ value });
  const newTimestamp = date.extractDate(value, 'YYYY/MM/DD').getTime();
  emit('update:modelValue', newTimestamp);
  qDateProxy.value?.hide();
}

// Regla de validación para el input
function isValidDate(value: string): boolean | string {
  if (!value) return true; // Permite que el campo esté vacío
  return (
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/.test(value) ||
    'Formato de fecha inválido'
  );
}
</script>
