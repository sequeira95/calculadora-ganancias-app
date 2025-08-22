<template>
  <q-input
    ref="qInputRef"
    v-model="displayModel"
    :label="label"
    type="text"
    inputmode="numeric"
    outlined
    dense
    :input-class="format === 'currency' ? 'text-right' : ''"
    @keydown="onNumericInput"
    @focus="moveCursorToEnd"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'; // 2. IMPORTAMOS ref

// --- DEFINICIONES ---
const props = defineProps<{
  modelValue: number;
  label: string;
  format?: 'integer' | 'currency';
}>();

const emit = defineEmits(['update:modelValue']);

// 3. CREAMOS LA REFERENCIA
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const qInputRef = ref<any>(null);

// 4. EXPONEMOS LA FUNCIÓN DE VALIDACIÓN DEL Q-INPUT
defineExpose({
  validate: () => qInputRef.value?.validate(),
});

// --- LÓGICA DE FORMATO ---
const displayModel = computed({
  get: () => {
    if (props.format === 'currency') {
      return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(props.modelValue);
    }
    // Por defecto, o si es 'integer'
    return String(props.modelValue);
  },
  set: (newValue: string) => {
    const digitsOnly = String(newValue).replace(/\D/g, '');
    const numberValue = parseInt(digitsOnly, 10) || 0;

    if (props.format === 'currency') {
      emit('update:modelValue', numberValue / 100);
    } else {
      emit('update:modelValue', numberValue);
    }
  },
});

// --- MANEJO DE EVENTOS ---
function onNumericInput(evt: KeyboardEvent) {
  if (
    !/^[0-9]$/.test(evt.key) &&
    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(evt.key)
  ) {
    evt.preventDefault();
  }
}

function moveCursorToEnd(evt: Event) {
  if (props.format !== 'currency') return;

  const target = evt.target as HTMLInputElement;
  setTimeout(() => {
    target.setSelectionRange(target.value.length, target.value.length);
  }, 0);
}
</script>
