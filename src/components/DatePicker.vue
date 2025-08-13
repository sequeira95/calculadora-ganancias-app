<template>
  <q-input
    filled
    v-model="displayDate"
    :label="label"
    mask="##/##/####"
    :rules="[isValidDate]"
    placeholder="DD/MM/YYYY"
    :dense="dense"
    hide-bottom-space
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
import { date as qDate, QPopupProxy } from 'quasar';

const props = defineProps<{
  modelValue: number | null; // El valor que recibimos es un timestamp o null
  label: string;
  dense?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const qDateProxy = ref<QPopupProxy | null>(null);

// Propiedad computada para manejar el v-model del q-input
const displayDate = computed({
  get: () => {
    return props.modelValue ? qDate.formatDate(props.modelValue, 'DD/MM/YYYY') : '';
  },
  set: (value: string) => {
    if (value && value.length === 10 && isValidDate(value) === true) {
      const newTimestamp = qDate.extractDate(value, 'DD/MM/YYYY').getTime();
      emit('update:modelValue', newTimestamp);
    } else if (!value) {
      emit('update:modelValue', null);
    }
  },
});

// Propiedad computada para el v-model del q-date (necesita formato YYYY/MM/DD)
const calendarDate = computed(() => {
  return props.modelValue ? qDate.formatDate(props.modelValue, 'YYYY/MM/DD') : '';
});

// Se activa cuando el usuario selecciona una fecha en el calendario
function updateFromCalendar(value: string) {
  const newTimestamp = qDate.extractDate(value, 'YYYY/MM/DD').getTime();
  emit('update:modelValue', newTimestamp);
  qDateProxy.value?.hide();
}

// Regla de validación para el input
function isValidDate(value: string): boolean | string {
  if (!value) return true;
  return (
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/.test(value) ||
    'Formato de fecha inválido'
  );
}
</script>
