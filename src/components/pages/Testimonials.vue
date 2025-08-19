<script setup>
import api from '@/api';
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch, nextTick } from 'vue'
import Swiper from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

const route = useRoute()
let swiper = null
const testimonials = ref([]);
const loading = ref(true);

onMounted(async () => {
    await fetchData();
});

// Watch testimonials and initialize Swiper when data is ready
watch(testimonials, async (newVal) => {
    if (newVal.length) {
        await nextTick(); // wait for DOM to update
        if (swiper) swiper.destroy(true, true); // destroy previous instance if exists
        swiper = new Swiper('.testimonials-slider', {
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            }
        });
    }
});

async function fetchData() {
    try {
        const resTestimonal = await api.get('/testimonial-list');

        if (resTestimonal.data?.Success) {
            testimonials.value = resTestimonal.data.Data || [];
        }
        console.log(testimonials);

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade"
            style="background-image: url(assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>Testimonials</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Testimonials</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Slider Testimonials Section -->
        <section id="slider-testimonials" class="slider-testimonials section light-background">

            <!-- Section Title -->
            <div class="container section-title" data-aos="fade-up">
                <h2>Testimonials</h2>
                <div><span>Check Our</span> <span class="description-title">Testimonials</span></div>
            </div><!-- End Section Title -->

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div v-if="loading" class="text-center">Loading testimonials...</div>
                <div v-else-if="!testimonials.length" class="text-center">No testimonials found.</div>

                <div v-else class="testimonials-slider swiper">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide" v-for="testimonial in testimonials" :key="testimonial.id">
                            <div class="testimonial-item">
                                <div class="row">
                                    <div class="col-lg-8">
                                        <p v-html="testimonial.message"></p>
                                        <div class="profile d-flex align-items-center">
                                            <img :src="testimonial.image_url ? testimonial.image_url : '/assets/img/person/demoUser.png'"
                                                class="profile-img" alt="">
                                            <div class="profile-info">
                                                <h3>{{ testimonial.name }}</h3>
                                                <span>{{ testimonial.profession }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-4 d-none d-lg-block">
                                        <div class="featured-img-wrapper">
                                            <img :src="testimonial.image_url ? testimonial.image_url : '/assets/img/person/demoUser.png'"
                                                class="featured-img" alt="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="swiper-navigation w-100 d-flex align-items-center justify-content-center">
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                    </div>
                </div>
            </div>
        </section><!-- /Slider Testimonials Section -->

        <!-- Testimonials Section -->
        <section id="testimonials" class="testimonials section">

            <div class="container">
                <div v-if="loading" class="text-center">Loading testimonials...</div>
                <div v-else-if="!testimonials.length" class="text-center">No testimonials found.</div>
                <div class="testimonial-masonry">

                    <div class="testimonial-item" :class="{ highlight: (index + 1) % 2 === 0 }" v-for="(testimonial, index) in testimonials" data-aos="fade-up" data-aos-delay="100">
                        <div class="testimonial-content">
                            <div class="quote-pattern">
                                <i class="bi bi-quote"></i>
                            </div>
                            <p v-html="testimonial?.message"></p>
                            <div class="client-info">
                                <div class="client-image">
                                    <img :src="testimonial.image_url ? testimonial.image_url : '/assets/img/person/demoUser.png'" alt="Client">
                                </div>
                                <div class="client-details">
                                    <h3>{{testimonial?.name}}</h3>
                                    <span class="position">{{testimonial?.profession}}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </section><!-- /Testimonials Section -->

    </main>

</template>