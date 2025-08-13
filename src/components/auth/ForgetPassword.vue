<script setup>
import showcaseBg from '@/assets/img/travel/showcase-8.webp'
import { ref } from 'vue'

const email = ref('')
const loading = ref(false) // Loading state

async function handleForgotPassword() {
  loading.value = true
  try {
    console.log('Email:', email.value)
    // Call forgot password API here
    // Example: await api.post('/forgot-password', { email: email.value })
  } catch (err) {
    console.error('Forgot password failed:', err)
    alert('Failed to send reset link. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="main">

    <div 
      class="page-title dark-background" 
      data-aos="fade"
      :style="{ backgroundImage: `url(${showcaseBg})` }"
    >
      <div class="container position-relative">
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a reset link</p>
        <nav class="breadcrumbs">
          <ol>
            <li><router-link to="/">Home</router-link></li>
            <li class="current">Forgot Password</li>
          </ol>
        </nav>
      </div>
    </div>

    <section class="section py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow p-4">
              <h3 class="text-center mb-4">Reset Your Password</h3>
              <form @submit.prevent="handleForgotPassword">
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input 
                    type="email" 
                    id="email" 
                    class="form-control" 
                    placeholder="Enter your email" 
                    v-model="email" 
                    required
                  >
                </div>
                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>
