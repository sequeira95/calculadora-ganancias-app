<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

/**
 * @param themeName El nombre del tema ('light', 'dark', 'pastel').
 */
function applyTheme(themeName: string) {
  // Guardar la preferencia del usuario
  localStorage.setItem('user-theme', themeName);

  // Lógica para el modo oscuro de Quasar
  $q.dark.set(themeName === 'dark');

  // Lógica para el tema personalizado
  // Añadimos o quitamos una clase del body para que el CSS reaccione
  if (themeName === 'pastel') {
    document.body.classList.add('theme-pastel');
  } else {
    document.body.classList.remove('theme-pastel');
  }
}

// Cuando la aplicación se monta por primera vez...
onMounted(() => {
  // ...leemos el tema guardado en el almacenamiento local.
  const savedTheme = localStorage.getItem('user-theme');
  if (savedTheme) {
    // Si existe un tema guardado, lo aplicamos.
    applyTheme(savedTheme);
  } else {
    // Si no, aplicamos el tema claro por defecto.
    applyTheme('light');
  }
});
</script>
