<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';

const gallery = ref([]);
const loading = ref(true);

onMounted(async () => {
    await fetchData();
});
async function fetchData() {
    try {
        const resGallery = await api.get('/gallery-list');

        if (resGallery.data?.Success) {
            gallery.value = resGallery.data.Data || [];
        }
        console.log(gallery);

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
            style="background-image: url(/assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>Gallery</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Gallery</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Gallery Slider Section -->
        <section id="gallery-slider" class="gallery-slider section" style="padding: 60px 0px 0px;">
            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="gallery-container">
                    <div class="swiper init-swiper" v-if="gallery.length">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide" v-for="item in gallery" :key="item.id">
                                <div class="gallery-item">
                                    <div class="gallery-img">
                                        <a class="glightbox" data-gallery="images-gallery" :href="item.image_url">
                                            <img :src="item.image_url" class="img-fluid" :alt="item.name" />
                                            <div class="gallery-overlay">
                                                <i class="bi bi-plus-circle"></i>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-button-prev"></div>
                    </div>

                    <!-- Fallback if no images -->
                    <div v-else class="text-center">No gallery images found.</div>
                </div>

            </div>
        </section>


        <section id="gallery" class="gallery" style="padding: 0px;">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row">
                    <div class="col-md-12">
                        <h4>Gallery</h4>
                        <hr>
                    </div>
                </div>

                <!-- Show loader -->
                <div v-if="loading" class="text-center">Loading gallery...</div>

                <!-- Show only if gallery has data -->
                <div v-else-if="gallery.length" class="isotope-layout" data-default-filter="*" data-layout="masonry"
                    data-sort="original-order">

                    <div class="row gallery-grid isotope-container" data-aos="fade-up" data-aos-delay="300">
                        <div class="col-xl-3 col-md-4 col-sm-6 gallery-item isotope-item" v-for="item in gallery"
                            :key="item.id">

                            <div class="gallery-card">
                                <div class="gallery-image">
                                    <img :src="item.image_url" class="img-fluid" :alt="item.name" />
                                </div>
                                <div class="gallery-overlay">
                                    <h4>{{ item.name }}</h4>
                                    <div class="gallery-actions">
                                        <a :href="item.image_url" title="View Image" class="glightbox">
                                            <i class="bi bi-eye"></i>
                                        </a>
                                        <!-- Example link if you have detail page -->
                                        <!-- <router-link :to="`/gallery-detail/${item.id}`">
                <i class="bi bi-info-circle"></i>
              </router-link> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- No data -->
                <div v-else class="text-center">No gallery images found.</div>

            </div>
        </section>


    </main>

</template>