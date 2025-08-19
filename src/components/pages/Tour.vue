<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const data = ref([]);
const categories = ref([]);
const destinations = ref([]);

const selectedDestination = ref('');
const selectedCategory = ref('');
const selectedDuration = ref('');
const selectedPrice = ref('');

const loading = ref(true);
const router = useRouter();

onMounted(async () => {
    await fetchData();
});

function isLoggedIn() {
    return !!localStorage.getItem("token");
}

async function fetchData() {
    try {
        const headers = {};
        if (isLoggedIn()) {
            headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
        }

        const [toursRes, categoriesRes] = await Promise.all([
            api.get('/tour-list', { headers }),
            api.get('/tour-category-list')
        ]);

        if (toursRes.data?.Success) {
            data.value = toursRes.data.Data.data || [];
            destinations.value = toursRes.data.Data.destinations || [];
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

// Fetch tours with filters
async function fetchTours() {
    try {
        loading.value = true;

        const headers = {};
        if (isLoggedIn()) {
            headers['Authorization'] = `Bearer ${localStorage.getItem("token")}`;
        }

        const params = {};
        if (selectedDestination.value) params.destination_id = selectedDestination.value;
        if (selectedCategory.value) params.category_id = selectedCategory.value;
        if (selectedDuration.value) params.duration = selectedDuration.value;
        if (selectedPrice.value) params.sort_by = selectedPrice.value;

        const res = await api.get('/tour-list', { params, headers });

        if (res.data?.Success) {
            data.value = res.data.Data.data || [];
            destinations.value = res.data.Data.destinations || [];
        }
    } catch (err) {
        console.error('Filter fetch error:', err);
    } finally {
        loading.value = false;
    }
}

// 👉 Add to wishlist
async function toggleWishlist(tour) {
    if (!isLoggedIn()) {
        router.push('/login');
        return;
    }

    if (tour.is_wishlist === 1) {
        toast.error("This tour is already in wishlist");
        return;
    }

    try {
        const res = await api.post(
            '/save-wishlist',
            { tour_id: tour.id },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data?.Success) {
            tour.is_wishlist = 1; // mark as added
            toast.success(res.data?.Message);
        }
    } catch (err) {
        console.error("Wishlist error:", err);
    }
}

</script>


<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade"
            style="background-image: url(assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>Tours</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Tours</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Travel Tours Section -->
        <section id="travel-tours" class="travel-tours section">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row">
                    <div class="col-lg-8 mx-auto text-center mb-5">
                        <h2>Find Your Perfect Tour</h2>
                        <p>Discover unforgettable travel experiences with our curated collection of tours. Explore by
                            destination, travel style, or date to find the adventure that's perfect for you.</p>
                    </div>
                </div>

                <!-- Tour Filters -->
                <div class="row mb-5" data-aos="fade-up" data-aos-delay="200">
                    <div class="col-12">
                        <div class="tour-filters">
                            <div class="row">
                                <div class="col-lg-3 col-md-6 mb-3">
                                    <select class="form-select" v-model="selectedDestination" @change="fetchTours">
                                        <option value="">Select Destination</option>
                                        <option v-for="destination in destinations" :key="destination"
                                            :value="destination.id">
                                            {{ destination.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-3">
                                    <select class="form-select" v-model="selectedCategory" @change="fetchTours">
                                        <option value="">Category</option>
                                        <option v-for="cat in categories" :key="cat.id" :value="cat.slug || cat.id">
                                            {{ cat.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-3">
                                    <select class="form-select" v-model="selectedDuration" @change="fetchTours">
                                        <option value="">Duration</option>
                                        <option value="1-3">1-3 Days</option>
                                        <option value="4-7">4-7 Days</option>
                                        <option value="8-14">8-14 Days</option>
                                        <option value="15+">15+ Days</option>
                                    </select>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-3">
                                    <select class="form-select" v-model="selectedPrice" @change="fetchTours">
                                        <option value="">Price Range</option>
                                        <option value="price_low_high">Low to High</option>
                                        <option value="price_high_low">High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Tour Grid -->
                <div class="row" data-aos="fade-up" data-aos-delay="600">
                    <div class="col-12">
                        <!-- <h3 class="section-subtitle mb-4">All Tours</h3> -->
                        <div v-if="loading" class="text-center">Loading tours...</div>
                        <div v-else-if="!data.length" class="text-center">No tours found.</div>
                        <div class="row" v-for="des in data" :key="des.destination_id">

                            <div class="col-md-12">
                                <h4>{{ des.destination_name }}</h4>
                                <hr>
                                <div v-if="!des.tours.length" class="text-center">No tours found.</div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4" v-for="tour in des.tours" :key="tour.id">
                                <!-- <router-link :to="`/tour-detail/${tour.slug}`"> -->
                                <div class="tour-card">
                                    <div class="tour-image">
                                        <img :src="tour.thumbnail_url" :alt="tour.title" class="img-fluid" />
                                        <div class="tour-price">
                                            <template
                                                v-if="Array.isArray(tour?.tour_date) && tour.tour_date.length > 0">
                                                <template
                                                    v-if="tour.tour_date[0].discount_price && tour.tour_date[0].discount_price > 0">
                                                    <del class="text-danger">${{ tour.tour_date[0].price }}</del>
                                                    <br>
                                                    <span class="text-white">${{ tour.tour_date[0].discount_price
                                                        }}</span>
                                                </template>
                                                <template v-else>
                                                    ${{ tour.tour_date[0].price }}
                                                </template>
                                            </template>
                                            <template v-else>
                                                $0
                                            </template>
                                        </div>
                                    </div>
                                    <div class="tour-content">
                                        <h4 class="one-line">{{ tour.title }}</h4>
                                        <p v-html="tour.short_description" class="one-line"></p>
                                        <div class="tour-details">
                                            <span><i class="bi bi-clock"></i> {{ tour.duration }}</span>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-2"
                                                style="background:#008cad; border-radius: 20px; text-align: center;">
                                                <router-link :to="`/tour-detail/${tour.slug}`" title="View Tour"
                                                    class="bt-outline-primary" style="font-size: 20px; color:#fff;">
                                                    <span class="bi bi-eye"></span>
                                                </router-link>
                                            </div>
                                            <div class="col-md-8"></div>
                                            <div class="col-md-2"
                                                :style="{ background: tour.is_wishlist === 1 ? 'red' : '#008cad', borderRadius: '20px', textAlign: 'center' }"
                                                @click="toggleWishlist(tour)">
                                                <span class="bi bi-heart"
                                                    style="font-size: 20px; color:#fff; cursor:pointer;"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- </router-link> -->
                            </div>
                        </div>
                    </div>
                </div>


                <!-- CTA Section -->
                <!-- <div class="row" data-aos="fade-up" data-aos-delay="700">
                    <div class="col-12">
                        <div class="cta-section text-center">
                            <h3>Not Sure What to Choose?</h3>
                            <p>Our travel experts are here to help you find the perfect tour based on your preferences
                                and budget.</p>
                            <div class="cta-buttons">
                                <router-link to="/#" class="bt-primary me-3">Contact Our Experts</router-link>
                                <router-link to="/#" class="bt-outline-primary">Take Our Travel Quiz</router-link>
                            </div>
                        </div>
                    </div>
                </div> -->

            </div>

        </section><!-- /Travel Tours Section -->

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