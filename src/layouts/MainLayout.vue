<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="lt-md"
        />

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

      <q-tabs inline-label class="bg-primary text-white gt-sm">
        <q-route-tab to="/" icon="inventory" label="Inventario" />
        <q-route-tab to="/expenses" icon="receipt_long" label="Gastos" />
        <q-route-tab to="/history" icon="history" label="Historial" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered :width="250">
      <q-list>
        <q-item-label header>Navegación</q-item-label>

        <q-item clickable v-ripple to="/" exact>
          <q-item-section avatar>
            <q-icon name="inventory" />
          </q-item-section>
          <q-item-section> Inventario </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/expenses" exact>
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section> Gastos </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/history" exact>
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section> Historial </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

// Lógica para controlar el estado del menú lateral
const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

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
