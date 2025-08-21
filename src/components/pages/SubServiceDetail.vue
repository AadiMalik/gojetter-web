<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { toast } from 'vue3-toastify'

const loading = ref(true)
const service = ref(null)


const route = useRoute()
const router = useRouter()

const fetchService = async () => {
    const slug = route.params.slug
    if (!slug) {
        router.push('/')
        return
    }

    loading.value = true
    try {
        const res = await api.get(`/sub-service-by-slug/${slug}`)
        if (res.data?.Success && res.data?.Data) {
            service.value = res.data.Data
            form.value.sub_service_id = service.value.id   // ✅ assign here
        } else {
            router.push('/')
        }
    } catch (error) {
        console.error(error)
        router.push('/')
    } finally {
        loading.value = false
    }
}

const form = ref({
    sub_service_id: 0,
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    age: 0,
    gender: '',
    specific_date: '',
    medical_history: '',
    file: null
})
// submit form
const submitForm = async () => {
    try {
        const formData = new FormData()
        Object.entries(form.value).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formData.append(key, value)
            }
        })

        const res = await api.post('/save-customer-request', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (res.data?.Success) {
            toast.success('Your request has been submitted successfully!')
            // reset form
            Object.keys(form.value).forEach(key => (form.value[key] = ''))
            form.value.sub_service_id = service.value.id
        } else {
            toast.error(res.data?.Message || 'Something went wrong!')
        }
    } catch (err) {
        console.error(err)
        toast.error('Failed to submit request.')
    }
}

onMounted(() => {
    fetchService()

})
</script>
<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade"
            :style="{ backgroundImage: `url(${service?.image_url})` }">
            <div class="container position-relative">
                <h1>{{ service?.name }}</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">{{ service?.name }}</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->
        <!-- Contact Section -->
        <section id="contact" class="contact section">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row">

                    <div class="col-md-12">
                        <p v-html="service?.description"></p>
                    </div>
                </div>

            </div>

            <!-- Contact Form Section (Overlapping) -->
            <div class="container form-container-overlap" style="margin-top: 0px;"
                v-if="service?.has_customer_form == 1">
                <div class="row justify-content-center" data-aos="fade-up" data-aos-delay="300">
                    <div class="col-lg-10">
                        <div class="contact-form-wrapper">
                            <h2 class="text-center mb-4">Enquire Now</h2>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-person text-danger"></i>
                                            <input type="text" class="form-control" v-model="form.name" name="name"
                                                placeholder="Full Name" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-envelope text-danger"></i>
                                            <input type="email" v-model="form.email" class="form-control" name="email"
                                                placeholder="Email Address" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-phone text-danger"></i>
                                            <input type="text" v-model="form.phone" class="form-control" name="phone"
                                                placeholder="Phone Number" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-flag text-danger"></i>
                                            <input type="text" v-model="form.country" class="form-control"
                                                name="country" placeholder="Country" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-building text-danger"></i>
                                            <input type="text" v-model="form.city" class="form-control" name="city"
                                                placeholder="City" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-person text-danger"></i>
                                            <input type="number" v-model="form.age" class="form-control" name="age"
                                                placeholder="Age in years" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-person text-danger"></i>
                                            <select class="form-control" v-model="form.gender" name="gender" required>
                                                <option value="" selected disabled>--Select Gender--</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-files"></i>
                                            <input type="file" @change="e => form.file = e.target.files[0]"
                                                class="form-control" name="file">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-calendar"></i>
                                            <input type="date" v-model="form.specific_date" class="form-control"
                                                name="specific_date">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <div class="input-with-icon">
                                            <i class="bi bi-file-medical"></i>
                                            <input type="text" v-model="form.medical_history" class="form-control"
                                                name="medical_history" placeholder="Medical History">
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 text-center">
                                    <button type="button" class="btn btn-primary btn-submit" @click="submitForm">SEND
                                        REQUEST</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section><!-- /Contact Section -->

    </main>

</template>