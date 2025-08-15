<script setup>
import showcaseBg from '@/assets/img/travel/showcase-8.webp'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const otp = ref(['', '', '', '', '', ''])
const loading = ref(false)
const resendLoading = ref(false)
const message = ref('')
const errors = ref('')
const countdown = ref(120) // 2 minutes countdown
const email = ref(route.query.email || '')

// Countdown logic
let timer = null
function startCountdown() {
  countdown.value = 120
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

onMounted(() => {
  startCountdown()
})

// OTP submit
async function handleOtpSubmit() {
  const code = otp.value.join('')
  loading.value = true
  message.value = ''
  errors.value = ''

  try {
    const { data } = await api.post('/verify-email-otp', { email: email.value, otp: code })
    if (data.Success) {
      toast.success(data.Message)
      setTimeout(() => router.push('/login'), 1500)
    } else {
      toast.error(data.Message);
    }
  } catch (err) {
    toast.error(err.response?.data?.Message || 'Something went wrong');
  } finally {
    loading.value = false
  }
}

// Resend OTP
async function handleResendOtp() {
  resendLoading.value = true

  try {
    const { data } = await api.post('/resend-email-otp', { email: email.value })
    if (data.Success) {
      toast.success(data.Message);
      startCountdown()
    } else {
      toast.error(data.Message);
    }
  } catch (err) {
    toast.error(err.response?.data?.Message || 'Something went wrong');
  } finally {
    resendLoading.value = false
  }
}

// Auto focus to next box
function handleInput(e, index) {
  if (e.target.value && index < otp.value.length - 1) {
    e.target.nextElementSibling?.focus()
  }
}
</script>


<template>
  <main class="main">
    <div class="page-title dark-background" :style="{ backgroundImage: `url(${showcaseBg})` }">
      <div class="container position-relative">
        <h1>OTP Verification</h1>
        <p>Enter the 6-digit code sent to your email</p>
      </div>
    </div>

    <section class="section py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow p-4 text-center">
              <h3 class="mb-4">Verify OTP</h3>

              <form @submit.prevent="handleOtpSubmit">
                <div class="d-flex justify-content-center mb-4">
                  <input v-for="(digit, i) in otp" :key="i" maxlength="1" class="form-control mx-1 text-center"
                    style="width:50px; font-size:1.5rem" v-model="otp[i]" required @input="handleInput($event, i)">

                </div>

                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Verifying...' : 'Verify' }}
                </button>

                <div class="mt-3">
                  <template v-if="countdown > 0">
                    <small>Please wait {{ countdown }}s before resending.</small>
                  </template>
                  <template v-else>
                    Didn’t receive code?
                    <a href="javascript:void(0)" @click="handleResendOtp">Resend</a>
                  </template>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
