<!-- components/Sidebar.vue -->
<template>
    <div class="list-group">
      <router-link to="/account/booking" class="list-group-item list-group-item-action">Bookings</router-link>
      <router-link to="/account/order" class="list-group-item list-group-item-action">Orders</router-link>
      <router-link to="/account/update-profile" class="list-group-item list-group-item-action">Update Profile</router-link>
      <router-link to="/account/change-password" class="list-group-item list-group-item-action">Change Password</router-link>
      <button class="list-group-item list-group-item-action text-danger" @click="logout">Logout</button>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/store/auth';
  const auth = useAuthStore();
  const logout = () => auth.logout();
  </script>
  