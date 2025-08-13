<script setup>
import showcaseBg from '@/assets/img/travel/showcase-8.webp'
import { ref } from 'vue'

const otp = ref(['', '', '', '', '', ''])
const loading = ref(false) // Loading state

async function handleOtpSubmit() {
  const code = otp.value.join('')
  console.log('OTP Code:', code)

  loading.value = true
  try {
    // Call verify OTP API here
    // Example:
    // await api.post('/verify-otp', { otp: code })
  } catch (err) {
    console.error('OTP verification failed:', err)
    alert('OTP verification failed. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="main">

    <!-- Page Title -->
    <div 
      class="page-title dark-background" 
      data-aos="fade"
      :style="{ backgroundImage: `url(${showcaseBg})` }"
    >
      <div class="container position-relative">
        <h1>OTP Verification</h1>
        <p>Enter the 6-digit code sent to your email</p>
        <nav class="breadcrumbs">
          <ol>
            <li><router-link to="/">Home</router-link></li>
            <li class="current">OTP Verification</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- OTP Section -->
    <section class="section py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow p-4 text-center">
              <h3 class="mb-4">Verify OTP</h3>
              <form @submit.prevent="handleOtpSubmit">
                <div class="d-flex justify-content-center mb-4">
                  <input v-for="(digit, i) in otp" :key="i" maxlength="1"
                         class="form-control mx-1 text-center"
                         style="width:50px; font-size:1.5rem"
                         v-model="otp[i]" required>
                </div>
                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ loading ? 'Verifying...' : 'Verify' }}
                </button>
                <div class="mt-3">
                  Didn’t receive code? <a href="#">Resend</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>
