<script setup>
import showcaseBg from '@/assets/img/travel/showcase-8.webp'
import { ref } from 'vue'

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false) // Loading state

async function handleResetPassword() {
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match')
        return
    }

    loading.value = true
    try {
        console.log('New Password:', password.value)
        // Call reset password API here
        // Example: await api.post('/reset-password', { password: password.value })
    } catch (err) {
        console.error('Reset password failed:', err)
        alert('Failed to reset password. Please try again.')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <main class="main">

        <div class="page-title dark-background" data-aos="fade" :style="{ backgroundImage: `url(${showcaseBg})` }">
            <div class="container position-relative">
                <h1>Reset Password</h1>
                <p>Enter your new password</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Reset Password</li>
                    </ol>
                </nav>
            </div>
        </div>

        <section class="section py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <div class="card shadow p-4">
                            <h3 class="text-center mb-4">Create New Password</h3>
                            <form @submit.prevent="handleResetPassword">
                                <div class="mb-3">
                                    <label for="password" class="form-label">New Password</label>
                                    <input type="password" id="password" class="form-control"
                                        placeholder="Enter new password" v-model="password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                                    <input type="password" id="confirmPassword" class="form-control"
                                        placeholder="Confirm password" v-model="confirmPassword" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {{ loading ? 'Resetting...' : 'Reset Password' }}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>
</template>
