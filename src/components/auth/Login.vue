<!-- Login.vue -->
<template>
    <main class="main">
  
      <!-- Page Title -->
      <div 
        class="page-title dark-background" 
        data-aos="fade"
        :style="{ backgroundImage: `url(${showcaseBg})` }"
      >
        <div class="container position-relative">
          <h1>Login</h1>
          <p>Sign in to continue your adventure with us</p>
          <nav class="breadcrumbs">
            <ol>
              <li><router-link to="/">Home</router-link></li>
              <li class="current">Login</li>
            </ol>
          </nav>
        </div>
      </div>
  
      <!-- Login Section -->
      <section id="login" class="section py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
              <div class="card shadow p-4">
                <h3 class="text-center mb-4">Sign In</h3>
                <form @submit.prevent="handleLogin">
  
                  <!-- Email or Username -->
                  <div class="mb-3">
                    <label for="login" class="form-label">Email or Username</label>
                    <input 
                      type="text" 
                      id="login" 
                      class="form-control" 
                      placeholder="Enter email or username" 
                      v-model="loginInput"
                      required
                    >
                  </div>
  
                  <!-- Password -->
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      class="form-control" 
                      placeholder="Enter password" 
                      v-model="password"
                      required
                    >
                  </div>
  
                  <!-- Remember me -->
                  <div class="mb-3 form-check">
                    <input type="checkbox" id="remember" class="form-check-input" v-model="remember">
                    <label for="remember" class="form-check-label">Remember me</label>
                  </div>
  
                  <!-- Submit -->
                  <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ loading ? 'Logging in...' : 'Login' }}
                  </button>
  
                  <div class="text-center mt-3">
                    <router-link to="/forgot-password">Forgot password?</router-link>
                  </div>
                  <div class="text-center mt-2">
                    Don't have an account? <router-link to="/register">Register</router-link>
                  </div>
  
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
  
    </main>
  </template>
  
  <script setup>
  import showcaseBg from '@/assets/img/travel/showcase-8.webp'
  import { ref } from 'vue'
  import { useAuthStore } from '@/store/auth'
  
  const loginInput = ref('')
  const password = ref('')
  const remember = ref(false)
  const loading = ref(false) // Loading state
  const auth = useAuthStore()
  
  async function handleLogin() {
    loading.value = true
    try {
      await auth.login(loginInput.value, password.value)
    } catch (err) {
      console.error('Login failed:', err)
      alert('Invalid credentials. Please try again.')
    } finally {
      loading.value = false
    }
  }
  </script>
  