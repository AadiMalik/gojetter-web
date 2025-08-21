<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

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
        const res = await api.get(`/service-by-slug/${slug}`)
        if (res.data?.Success && res.data?.Data) {
            service.value = res.data.Data
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


onMounted(() => {
    fetchService()

})
watch(
    () => route.params.slug,
    () => {
        fetchService()
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // smooth scrolling
        })
    }
)
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

        <section id="travel-destinations" class="travel-destinations section container" style="padding-bottom: 0px;">
            <div class="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">
                <div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="300"
                    v-if="service?.sub_services?.length">
                    <div class="col-md-12">
                        <h3>Sub Services</h3>
                        <hr>
                    </div>
                    <div v-if="loading" class="text-center">Loading sub services...</div>
                    <div class="row">
                        <div v-for="sub_service in service?.sub_services" :key="sub_service?.id"
                            class="col-lg-4 col-md-6 destination-item isotope-item filter-coastal">
                            <router-link :to="`/sub-service/${sub_service?.slug}`" class="destination-tile">
                                <div class="tile-image">
                                    <img :src="sub_service?.image_url" alt="{{ sub_service?.name }}" class="img-fluid"
                                        loading="lazy">
                                    <div class="overlay-content">
                                        <div class="destination-info">
                                            <h4 class="one-line">{{ sub_service?.name }}</h4>
                                            <p v-html="sub_service?.description" class="one-line"></p>
                                        </div>
                                    </div>
                                </div>
                            </router-link>
                        </div><!-- End Destination Item -->
                    </div>
                </div><!-- End Destinations Container -->
            </div>
        </section>
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
            <div v-if="service?.has_contact_form == 1" class="row justify-content-center" data-aos="fade-up"
                data-aos-delay="300">
                <div class="col-lg-3 contact-form-wrapper" style="box-shadow:none;">
                    <router-link to="/contact" class="btn btn-primary btn-submit form-control">Contact Us</router-link>
                </div>
            </div>

        </section><!-- /Contact Section -->

    </main>

</template>