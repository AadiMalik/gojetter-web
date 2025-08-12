<script setup>
import showcaseBg from '/assets/img/travel/showcase-8.webp'
import showcaseImg from '/assets/img/travel/showcase-7.webp'
import { onMounted, ref } from 'vue';
import axios from 'axios';

const tours = ref([]);
const loading = ref(true)

onMounted(async () => {
    try {
        const res = await axios.get('https://admin.go-jetter.com/api/tour-list?type=Activity')
        if (res.data?.Success) {
            tours.value = res.data.Data || []
        } else {
            console.error('API error:', res.data?.Message)
        }
    } catch (err) {
        console.error('Fetch error:', err)
    } finally {
        loading.value = false
    }
})
</script>
<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade"
            style="background-image: url(/assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>Destinations</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Destinations</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Travel Destinations Section -->
        <section id="travel-destinations" class="travel-destinations section">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row">
                    <div class="col-lg-8 mx-auto text-center">
                        <h2>Uncover Captivating Travel Experiences</h2>
                        <p class="mb-5">From the bustling energy of cosmopolitan cities to the serene embrace of
                            untouched wilderness, embark on incredible journeys to the planet's most enchanting
                            destinations. We're here to help you craft memories that will last a lifetime.</p>
                    </div>
                </div>

                <div class="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">
                    <!-- <ul class="destination-filters isotope-filters" data-aos="fade-up" data-aos-delay="200">
                        <li data-filter="*" class="filter-active">All Locales</li>
                        <li data-filter=".filter-tropical">Tropical</li>
                        <li data-filter=".filter-mountain">Alpine</li>
                        <li data-filter=".filter-urban">Cityscapes</li>
                        <li data-filter=".filter-historical">Heritage</li>
                        <li data-filter=".filter-coastal">Seaside</li>
                    </ul> -->
                    <!-- End Destination Filters -->

                    <div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="300">

                        <div v-for="tour in tours" :key="tour.id" class="col-lg-4 col-md-6 destination-item isotope-item filter-coastal">
                            <router-link :to="`/tour-detail/${tour.slug}`" class="destination-tile">
                                <div class="tile-image">
                                    <img :src="tour.thumbnail_url" alt="{{ tour.title }}" class="img-fluid"
                                        loading="lazy">
                                    <div class="overlay-content">
                                        <span class="destination-tag luxury">{{ tour.tour_category.name }}</span>
                                        <div class="destination-info">
                                            <h4>{{ tour.title }}</h4>
                                            <p v-html="tour.short_description"></p>
                                            <div class="destination-stats">
                                                <span class="tours-available"><i class="bi bi-map"></i> {{ tour.duration }}</span>
                                                <span class="starting-price">$ {{ tour.price }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </router-link>
                        </div><!-- End Destination Item -->

                    </div><!-- End Destinations Container -->

                </div>

                <div class="row mt-5">
                    <div class="col-lg-10 mx-auto text-center" data-aos="fade-up" data-aos-delay="400">
                        <div class="planning-assistance">
                            <div class="assistance-content">
                                <h3>Let Our Team Help Curate Your Perfect Expedition</h3>
                                <p>Unsure which destination aligns with your travel aspirations? Our seasoned travel
                                    advisors are poised to design a bespoke itinerary tailored just for you.</p>
                                <div class="assistance-actions">
                                    <router-link to="/#" class="btn btn-py">Receive Complimentary
                                        Consultation</router-link>
                                    <router-link to="/#" class="btn btn-oe">Explore All Available Tours</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </section><!-- /Travel Destinations Section -->

    </main>
</template>