<!-- views/AccountLayout.vue -->
<template>
  <main class="main">

    <!-- Page Title -->
    <div class="page-title dark-background" data-aos="fade" :style="{ backgroundImage: `url(${showcaseBg})` }">
      <div class="container position-relative">
        <h1>Account</h1>
        <p>View orders, bookings, and manage your profile.</p>
        <nav class="breadcrumbs">
          <ol>
            <li><router-link to="/">Home</router-link></li>
            <li class="current">Account</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-3">
          <Sidebar />
        </div>
        <div class="col-md-9">
          <router-view />
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
  import showcaseBg from '@/assets/img/travel/showcase-8.webp'
import Sidebar from '@/components/accounts/Sidebar.vue';
</script>