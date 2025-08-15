<template>
  <main class="main">
    <!-- Page Title -->
    <div class="page-title dark-background" data-aos="fade" :style="{ backgroundImage: `url(${showcaseBg})` }">
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
              <!-- Dynamic Message -->
              <form @submit.prevent="handleLogin">
                <!-- Email or Username -->
                <div class="mb-3">
                  <label for="login" class="form-label">Email</label>
                  <input type="email" id="login" class="form-control" placeholder="Enter email" v-model="loginInput"
                    required />
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input type="password" id="password" class="form-control" placeholder="Enter password"
                    v-model="password" required />
                </div>

                <!-- Remember me -->
                <div class="mb-3 form-check">
                  <input type="checkbox" id="remember" class="form-check-input" v-model="remember" />
                  <label for="remember" class="form-check-label">Remember me</label>
                </div>

                <!-- Submit -->
                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                  {{ loading ? "Logging in..." : "Login" }}
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
import showcaseBg from "@/assets/img/travel/showcase-8.webp"
import { ref } from "vue"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "vue-router"
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const loginInput = ref("")
const password = ref("")
const remember = ref(false)
const loading = ref(false)

const auth = useAuthStore()

async function handleLogin() {
  loading.value = true;
  try {
    const res = await auth.login(loginInput.value, password.value);

    if (res?.otpRequired) {
      toast.success(res.message);
      router.push({
        path: '/otp-verify',
        query: { email: res.email }
      });
      return;
    }

    router.push('/account/booking');

  } catch (err) {
    toast.error(err.message || 'Invalid credentials. Please try again.');
  } finally {
    loading.value = false;
  }
}
</script>
