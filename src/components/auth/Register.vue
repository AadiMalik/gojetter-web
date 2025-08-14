<script setup>
import showcaseBg from '@/assets/img/travel/showcase-8.webp'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const username = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)
const loading = ref(false) // Loading state
const errors = ref('')
const message = ref('')

async function handleRegister() {
    errors.value = '';
    message.value = ''
    if (password.value !== confirmPassword.value) {
        errors.value = 'Passwords do not match'
        return
    }

    loading.value = true
    try {
        const response = await api.post('/register', {
            username: username.value,
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: confirmPassword.value
        })
        console.error(response.data.Message)
        if (response.data && response.data.Success) {
            message.value = response.data.Message;
            // ✅ Redirect only if success
            router.push({
                path: '/otp-verify',
                query: { email: email.value }
            })
        } else {
            errors.value = response.data?.Message || 'Registration failed'
        }
    } catch (err) {
        errors.value = 'Registration failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade" :style="{ backgroundImage: `url(${showcaseBg})` }">
            <div class="container position-relative">
                <h1>Register</h1>
                <p>Create an account to start your adventure with us</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Register</li>
                    </ol>
                </nav>
            </div>
        </div>

        <!-- Register Section -->
        <section id="register" class="section py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <div class="card shadow p-4">
                            <h3 class="text-center mb-4">Create Account</h3>
                            <!-- Backend Errors -->
                            <div v-if="errors" class="alert alert-danger text-center mb-3">
                                {{ errors }}
                            </div>

                            <!-- Show success only if no error -->
                            <div v-else-if="message" class="alert alert-success text-center mb-3">
                                {{ message }}
                            </div>
                            <form @submit.prevent="handleRegister">

                                <!-- Username -->
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username<span
                                            class="text-danger">**</span></label>
                                    <input type="text" id="username" class="form-control"
                                        placeholder="Enter your username" v-model="username" required>
                                </div>
                                <!-- Full Name -->
                                <div class="mb-3">
                                    <label for="name" class="form-label">Full Name<span
                                            class="text-danger">*</span></label>
                                    <input type="text" id="name" class="form-control" placeholder="Enter your name"
                                        v-model="name" required>
                                </div>

                                <!-- Email -->
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email<span
                                            class="text-danger">**</span></label>
                                    <input type="email" id="email" class="form-control" placeholder="Enter email"
                                        v-model="email" required>
                                </div>

                                <!-- Password -->
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password<span
                                            class="text-danger">*</span></label>
                                    <input type="password" id="password" class="form-control"
                                        placeholder="Enter password" v-model="password" required>
                                </div>

                                <!-- Confirm Password -->
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm Password<span
                                            class="text-danger">*</span></label>
                                    <input type="password" id="confirmPassword" class="form-control"
                                        placeholder="Confirm password" v-model="confirmPassword" required>
                                </div>

                                <!-- Terms -->
                                <div class="mb-3 form-check">
                                    <input type="checkbox" id="agree" class="form-check-input" v-model="agree" required>
                                    <label for="agree" class="form-check-label">
                                        I agree to the terms and conditions
                                    </label>
                                </div>

                                <!-- Submit -->
                                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                        aria-hidden="true"></span>
                                    {{ loading ? 'Registering...' : 'Register' }}
                                </button>

                                <!-- Link to login -->
                                <div class="text-center mt-3">
                                    Already have an account? <router-link to="/login">Login</router-link>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>
</template>
