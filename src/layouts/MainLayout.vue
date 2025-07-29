<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Calculadora de Ganancias </q-toolbar-title>

        <q-btn-dropdown stretch flat icon="palette">
          <q-list>
            <q-item-label header>Temas</q-item-label>
            <q-item clickable v-ripple @click="applyTheme('light')">
              <q-item-section avatar>
                <q-icon name="wb_sunny" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Claro</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="applyTheme('dark')">
              <q-item-section avatar>
                <q-icon name="nights_stay" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Oscuro</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="applyTheme('pastel')">
              <q-item-section avatar>
                <q-icon name="filter_vintage" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Rosa Pastel</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>

      <q-tabs inline-label class="bg-primary text-white" indicator-color="white" align="justify">
        <q-route-tab to="/" icon="inventory" label="Inventario" />
        <q-route-tab to="/sales" icon="history" label="Historial de Ventas" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

const $q = useQuasar();

function applyTheme(themeName: string) {
  localStorage.setItem('user-theme', themeName);
  $q.dark.set(themeName === 'dark');
  if (themeName === 'pastel') {
    document.body.classList.add('theme-pastel');
  } else {
    document.body.classList.remove('theme-pastel');
  }
}
</script>
