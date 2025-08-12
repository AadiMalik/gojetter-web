<script setup>
import HeaderComponent from './components/layouts/HeaderComponent.vue'
import FooterComponent from './components/layouts/FooterComponent.vue'
import Home from './components/pages/Home.vue'
</script>

<template>
  <div>
    <HeaderComponent />
    <router-view />
    <FooterComponent />
  </div>
</template>
