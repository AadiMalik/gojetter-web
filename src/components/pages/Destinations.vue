<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import api from '@/api';

const tours_data = ref([]);
const activity_data = ref([]);
const loading = ref(true);
const categories = ref([]);
const destinations = ref([]);

const selectedDestination = ref('');
const selectedCategory = ref('');
const selectedDuration = ref('');
const selectedPrice = ref('');

onMounted(async () => {
    await fetchData();
});

async function fetchData() {
    try {
        // Run multiple APIs in parallel
        const [toursRes, activitiesRes, categoriesRes] = await Promise.all([
            api.get('/tour-list'),
            api.get('/activity-list'),
            api.get('/tour-category-list')
        ]);

        if (toursRes.data?.Success) {
            tours_data.value = toursRes.data.Data.data || [];
            destinations.value = toursRes.data.Data.destinations || [];
        }
        console.log(tours_data);
        if (activitiesRes.data?.Success) {
            activity_data.value = activitiesRes.data.Data.data || [];
        }
        if (categoriesRes.data?.Success) {
            categories.value = categoriesRes.data.Data || [];
        }

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
}
async function fetchToursAndActivity() {
    try {
        loading.value = true;

        const params = {};
        if (selectedDestination.value) params.destination_id = selectedDestination.value;
        if (selectedCategory.value) params.category_id = selectedCategory.value;
        if (selectedDuration.value) params.duration = selectedDuration.value;
        if (selectedPrice.value) params.sort_by = selectedPrice.value;
        const [toursRes, activitiesRes] = await Promise.all([
            api.get('/tour-list', { params }),
            api.get('/activity-list', { params })
        ]);

        if (toursRes.data?.Success) {
            tours_data.value = toursRes.data.Data.data || [];
            destinations.value = toursRes.data.Data.destinations || [];
        }
        if (activitiesRes.data?.Success) {
            activity_data.value = activitiesRes.data.Data.data || [];
        }
    } catch (err) {
        console.error('Filter fetch error:', err);
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
                <div class="row mb-5" data-aos="fade-up" data-aos-delay="200">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-lg-3 col-md-6 mb-3">
                                        <select class="form-select" v-model="selectedDestination"
                                            @change="fetchToursAndActivity">
                                            <option value="">Select Destination</option>
                                            <option v-for="destination in destinations" :key="destination"
                                                :value="destination.id">
                                                {{ destination.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-lg-3 col-md-6 mb-3">
                                        <select class="form-select" v-model="selectedCategory"
                                            @change="fetchToursAndActivity">
                                            <option value="">Category</option>
                                            <option v-for="cat in categories" :key="cat.id" :value="cat.slug || cat.id">
                                                {{ cat.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-lg-3 col-md-6 mb-3">
                                        <select class="form-select" v-model="selectedDuration"
                                            @change="fetchToursAndActivity">
                                            <option value="">Duration</option>
                                            <option value="1-3">1-3 Days</option>
                                            <option value="4-7">4-7 Days</option>
                                            <option value="8-14">8-14 Days</option>
                                            <option value="15+">15+ Days</option>
                                        </select>
                                    </div>
                                    <div class="col-lg-3 col-md-6 mb-3">
                                        <select class="form-select" v-model="selectedPrice"
                                            @change="fetchToursAndActivity">
                                            <option value="">Price Range</option>
                                            <option value="price_low_high">Low to High</option>
                                            <option value="price_high_low">High to Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- tours -->
                <div class="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">

                    <div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
                        <div class="col-md-12">
                            <h3>Tours</h3>
                            <hr>
                        </div>
                        <div v-if="loading" class="text-center">Loading tours...</div>
                        <div v-else-if="!tours_data?.length" class="text-center">No tours found.</div>
                        <div class="row" v-for="des in tours_data" :key="des?.destination_id">

                            <div class="col-md-12" v-if="des?.tours?.length">
                                <h5>{{ des?.destination_name }}</h5>
                                <hr>
                                <div v-if="!des?.tours?.length" class="text-center">No tours found.</div>
                            </div>
                            <div v-for="tour in des.tours" :key="tour.id"
                                class="col-lg-4 col-md-6 destination-item isotope-item filter-coastal">
                                <router-link :to="`/tour-detail/${tour?.slug}`" class="destination-tile">
                                    <div class="tile-image">
                                        <img :src="tour.thumbnail_url" alt="{{ tour.title }}" class="img-fluid"
                                            loading="lazy">
                                        <div class="overlay-content">
                                            <span class="destination-tag luxury">{{ tour?.destination?.name }}</span>
                                            <div class="destination-info">
                                                <h4 class="one-line">{{ tour?.title }}</h4>
                                                <p v-html="tour?.short_description" class="one-line"></p>
                                                <div class="destination-stats">
                                                    <span class="tours-available"><i class="bi bi-map"></i> {{
                                                        tour?.duration
                                                        }}</span>
                                                    <span class="starting-price">${{ Array.isArray(tour?.tour_date) &&
                                                        tour?.tour_date?.length > 0
                                                        ? `${tour?.tour_date[0]?.price}`
                                                        : '0'
                                                    }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </router-link>
                            </div><!-- End Destination Item -->
                        </div>
                    </div><!-- End Destinations Container -->

                </div>

                <!-- activities -->
                <div class="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">

                    <div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
                        <div class="col-md-12">
                            <h3>Activities</h3>
                            <hr>
                        </div>
                        <div v-if="loading" class="text-center">Loading activities...</div>
                        <div v-else-if="!activity_data?.length" class="text-center">No activities found.</div>
                        <div class="row" v-for="des in activity_data" :key="des?.destination_id">

                            <div class="col-md-12" v-if="des?.activities?.length">
                                <h5>{{ des?.destination_name }}</h5>
                                <hr>
                                <div v-if="!des?.activities?.length" class="text-center">No activities found.</div>
                            </div>
                            <div v-for="activity in des.activities" :key="activity.id"
                                class="col-lg-4 col-md-6 destination-item isotope-item filter-coastal">
                                <router-link :to="`/activity-detail/${activity?.slug}`" class="destination-tile">
                                    <div class="tile-image">
                                        <img :src="activity.thumbnail_url" alt="{{ activity.title }}" class="img-fluid"
                                            loading="lazy">
                                        <div class="overlay-content">
                                            <span class="destination-tag luxury">{{ activity?.destination?.name }}</span>
                                            <div class="destination-info">
                                                <h4 class="one-line">{{ activity?.title }}</h4>
                                                <p v-html="activity?.short_description" class="one-line"></p>
                                                <div class="destination-stats">
                                                    <span class="tours-available"><i class="bi bi-map"></i> {{
                                                        activity?.duration
                                                        }}</span>
                                                    <span class="starting-price">${{ Array.isArray(activity?.activity_date) &&
                                                        activity?.activity_date?.length > 0
                                                        ? `${activity?.activity_date[0]?.price}`
                                                        : '0'
                                                        }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </router-link>
                            </div><!-- End Destination Item -->
                        </div>
                    </div><!-- End Destinations Container -->

                </div>

            </div>

        </section><!-- /Travel Destinations Section -->

    </main>
</template>
<style>
.one-line {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    /* show only 1 line */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
}
</style>