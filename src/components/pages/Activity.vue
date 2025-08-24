<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useCurrencyStore } from "@/store/currency";
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const currency = useCurrencyStore();
const authStore = useAuthStore();
const router = useRouter();

const data = ref([]);
const categories = ref([]);
const destinations = ref([]);

const selectedDestination = ref('');
const selectedCategory = ref('');
const selectedDuration = ref('');
const selectedPrice = ref('');

const loading = ref(true);

onMounted(async () => {
    await fetchData();
});

function isLoggedIn() {
    return !!authStore.user;
}

async function fetchData() {
    try {
        const params = {};

        if (isLoggedIn()) {
            params.user_id = authStore.user.id;
        }

        const [activitiesRes, categoriesRes] = await Promise.all([
            api.get('/activity-list', { params }),
            api.get('/tour-category-list')
        ]);

        if (activitiesRes.data?.Success) {
            data.value = activitiesRes.data.Data.data || [];
            destinations.value = activitiesRes.data.Data.destinations || [];
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

// Fetch activities with filters
async function fetchActivities() {
    try {
        loading.value = true;
        const params = {};

        if (isLoggedIn()) {
            params.user_id = authStore.user.id;
        }

        if (selectedDestination.value) params.destination_id = selectedDestination.value;
        if (selectedCategory.value) params.category_id = selectedCategory.value;
        if (selectedDuration.value) params.duration = selectedDuration.value;
        if (selectedPrice.value) params.sort_by = selectedPrice.value;

        const res = await api.get('/activity-list', { params });

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
async function toggleWishlist(activity) {
    if (!isLoggedIn()) {
        router.push('/login');
        return;
    }

    if (activity.is_wishlist === 1) {
        toast.error("This activity is already in wishlist");
        return;
    }

    try {
        const res = await api.post('/save-wishlist', {
            activity_id: activity.id,
            user_id: authStore.user.id  // 👈 pass user_id explicitly
        });

        if (res.data?.Success) {
            activity.is_wishlist = 1;
            toast.success(res.data?.Message);
        }
    } catch (err) {
        console.error("Wishlist error:", err);
    }
}

// 👉 Remove from wishlist
async function removeWishlist(activity) {
    if (!isLoggedIn()) {
        router.push('/login');
        return;
    }

    if (activity.is_wishlist === 0) {
        toast.error("This activity is not in wishlist");
        return;
    }

    try {
        const res = await api.post('/delete-wishlist', {
            activity_id: activity.id,
            user_id: authStore.user.id  // 👈 pass user_id explicitly
        });

        if (res.data?.Success) {
            activity.is_wishlist = 0;
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
                <h1>Activities</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Activities</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Travel Activities Section -->
        <section id="travel-tours" class="travel-tours section">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row">
                    <div class="col-lg-8 mx-auto text-center mb-5">
                        <h2>Find Your Perfect Activity</h2>
                        <p>Discover unforgettable travel experiences with our curated collection of activities. Explore
                            by
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
                                    <select class="form-select" v-model="selectedCategory" @change="fetchActivities">
                                        <option value="">Category</option>
                                        <option v-for="cat in categories" :key="cat.id" :value="cat.slug || cat.id">
                                            {{ cat.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-3">
                                    <select class="form-select" v-model="selectedDuration" @change="fetchActivities">
                                        <option value="">Duration</option>
                                        <option value="1-3">1-3 Hours</option>
                                        <option value="4-7">4-7 Hours</option>
                                        <option value="8-14">8-14 Hours</option>
                                        <option value="15+">15+ Hours</option>
                                    </select>
                                </div>
                                <div class="col-lg-3 col-md-6 mb-3">
                                    <select class="form-select" v-model="selectedPrice" @change="fetchActivities">
                                        <option value="">Price Range</option>
                                        <option value="price_low_high">Low to High</option>
                                        <option value="price_high_low">High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Featured Tours Slider -->
                <!-- <div class="row mb-5" data-aos="fade-up" data-aos-delay="300">
                    <div class="col-12">
                        <h3 class="section-subtitle mb-4">Featured Tours</h3>
                        <div class="featured-tours-slider swiper init-swiper">
                            <div class="swiper-wrapper">
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-15.webp" alt="Bali Adventure"
                                                class="img-fluid">
                                            <div class="tour-badge">Best Seller</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Bali Adventure Escape</h4>
                                            <p>Discover the mystical beauty of Bali with temple visits, volcano hiking,
                                                and pristine beaches.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 7 Days</span>
                                                <span class="price">From $899</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-22.webp" alt="Paris Romance"
                                                class="img-fluid">
                                            <div class="tour-badge">Luxury</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Romantic Paris Getaway</h4>
                                            <p>Experience the city of love with premium accommodations and exclusive
                                                dining.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 5 Days</span>
                                                <span class="price">From $1299</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-8.webp" alt="Tokyo Culture"
                                                class="img-fluid">
                                            <div class="tour-badge">New</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Tokyo Cultural Experience</h4>
                                            <p>Immerse yourself in Japanese culture, from traditional tea ceremonies to
                                                modern city life.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 10 Days</span>
                                                <span class="price">From $1599</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-14.webp" alt="Norwegian Fjords"
                                                class="img-fluid">
                                            <div class="tour-badge">Popular</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Norwegian Fjords Cruise</h4>
                                            <p>Sail through dramatic fjords and witness the stunning landscapes of
                                                Norway's coastline.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 9 Days</span>
                                                <span class="price">From $1899</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-7.webp" alt="Egyptian Adventure"
                                                class="img-fluid">
                                            <div class="tour-badge">Cultural</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Ancient Egypt Explorer</h4>
                                            <p>Journey through time visiting pyramids, temples, and sailing the
                                                legendary Nile River.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 8 Days</span>
                                                <span class="price">From $1149</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-19.webp" alt="Costa Rica Adventure"
                                                class="img-fluid">
                                            <div class="tour-badge">Adventure</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Costa Rica Eco Adventure</h4>
                                            <p>Experience rainforest canopy tours, wildlife viewing, and pristine
                                                beaches in this eco paradise.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 6 Days</span>
                                                <span class="price">From $749</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-2.webp" alt="Greek Islands"
                                                class="img-fluid">
                                            <div class="tour-badge">Summer Special</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Greek Islands Hopping</h4>
                                            <p>Explore the stunning Greek islands, from Santorini's sunsets to Mykonos'
                                                vibrant nightlife.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 11 Days</span>
                                                <span class="price">From $1399</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="featured-tour-card">
                                        <div class="tour-image">
                                            <img src="/assets/img/travel/tour-25.webp" alt="Patagonia Trek"
                                                class="img-fluid">
                                            <div class="tour-badge">Extreme</div>
                                        </div>
                                        <div class="tour-content">
                                            <h4>Patagonia Wilderness Trek</h4>
                                            <p>Challenge yourself in one of the world's last great wildernesses with
                                                glaciers and mountain peaks.</p>
                                            <div class="tour-meta">
                                                <span class="duration"><i class="bi bi-clock"></i> 12 Days</span>
                                                <span class="price">From $2299</span>
                                            </div>
                                            <router-link to="/tour-details" class="btn btn-primary">View
                                                Details</router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-pagination"></div>
                        </div>
                    </div>
                </div> -->

                <!-- Tour Categories -->
                <!-- <div class="row mb-5" data-aos="fade-up" data-aos-delay="400">
                    <div class="col-12">
                        <h3 class="section-subtitle mb-4">Browse by Category</h3>
                        <div class="row">
                            <div class="col-lg-2 col-md-4 col-6 mb-3">
                                <div class="category-card">
                                    <div class="category-icon">
                                        <i class="bi bi-compass"></i>
                                    </div>
                                    <h5>Adventure</h5>
                                </div>
                            </div>
                            <div class="col-lg-2 col-md-4 col-6 mb-3">
                                <div class="category-card">
                                    <div class="category-icon">
                                        <i class="bi bi-gem"></i>
                                    </div>
                                    <h5>Luxury</h5>
                                </div>
                            </div>
                            <div class="col-lg-2 col-md-4 col-6 mb-3">
                                <div class="category-card">
                                    <div class="category-icon">
                                        <i class="bi bi-people"></i>
                                    </div>
                                    <h5>Family</h5>
                                </div>
                            </div>
                            <div class="col-lg-2 col-md-4 col-6 mb-3">
                                <div class="category-card">
                                    <div class="category-icon">
                                        <i class="bi bi-palette"></i>
                                    </div>
                                    <h5>Cultural</h5>
                                </div>
                            </div>
                            <div class="col-lg-2 col-md-4 col-6 mb-3">
                                <div class="category-card">
                                    <div class="category-icon">
                                        <i class="bi bi-sun"></i>
                                    </div>
                                    <h5>Beach</h5>
                                </div>
                            </div>
                            <div class="col-lg-2 col-md-4 col-6 mb-3">
                                <div class="category-card">
                                    <div class="category-icon">
                                        <i class="bi bi-building"></i>
                                    </div>
                                    <h5>City</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->

                <!-- Special Offers -->
                <!-- <div class="row mb-5" data-aos="fade-up" data-aos-delay="500">
                    <div class="col-12">
                        <div class="special-offers">
                            <h3 class="section-subtitle mb-4">Last-Minute Deals</h3>
                            <div class="row">
                                <div class="col-lg-6 mb-4">
                                    <div class="offer-banner">
                                        <div class="offer-content">
                                            <div class="discount-badge">30% OFF</div>
                                            <h4>Mediterranean Cruise</h4>
                                            <p>Explore Italy, Greece, and Spain with luxury accommodations and gourmet
                                                dining.</p>
                                            <span class="urgency">Only 3 seats left!</span>
                                            <router-link to="/booking" classss="btn btn-accent">Book Now</router-link>
                                        </div>
                                        <div class="offer-image">
                                            <img src="/assets/img/travel/misc-12.webp" alt="Cruise" class="img-fluid">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6 mb-4">
                                    <div class="offer-banner">
                                        <div class="offer-content">
                                            <div class="discount-badge">25% OFF</div>
                                            <h4>African Safari</h4>
                                            <p>Witness the great migration and encounter magnificent wildlife in their
                                                natural habitat.</p>
                                            <span class="urgency">Limited time offer!</span>
                                            <router-link to="/booking" class="btn btn-accent">Book Now</router-link>
                                        </div>
                                        <div class="offer-image">
                                            <img src="/assets/img/travel/misc-8.webp" alt="Safari" class="img-fluid">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->

                <!-- Tour Grid -->
                <div class="row" data-aos="fade-up" data-aos-delay="600">
                    <div class="col-12">
                        <!-- <h3 class="section-subtitle mb-4">All Tours</h3> -->
                        <div v-if="loading" class="text-center">Loading activities...</div>
                        <div v-else-if="!data.length" class="text-center">No activities found.</div>
                        <div class="row" v-for="des in data" :key="des.destination_id">

                            <div class="col-md-12">
                                <h4>{{ des.destination_name }}</h4>
                                <hr>
                                <div v-if="!des.activities.length" class="text-center">No activities found.</div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4" v-for="activity in des.activities" :key="activity.id">
                                <!-- <router-link :to="`/activity-detail/${activity.slug}`"> -->
                                <div class="tour-card">
                                    <div class="tour-image">
                                        <img :src="activity.thumbnail_url" alt="Tour image" class="img-fluid" />
                                        <div class="tour-price">
                                            <template
                                                v-if="Array.isArray(activity?.activity_date) && activity.activity_date.length > 0">
                                                <template
                                                    v-if="activity.activity_date[0].discount_price && activity.activity_date[0].discount_price > 0">
                                                    <del class="text-danger">{{
                                                        currency.format(activity.activity_date[0].price)
                                                        }}</del>
                                                    <br>
                                                    <span class="text-white">{{
                                                        currency.format(activity.activity_date[0].discount_price)
                                                    }}</span>
                                                </template>
                                                <template v-else>
                                                    {{ currency.format(activity.activity_date[0].price) }}
                                                </template>
                                            </template>
                                            <template v-else>
                                                {{ currency.format(0) }}
                                            </template>
                                        </div>
                                    </div>
                                    <div class="tour-content">
                                        <h4 class="one-line">{{ activity.title }}</h4>
                                        <p v-html="activity.short_description" class="one-line"></p>
                                        <div class="tour-details">
                                            <span><i class="bi bi-clock"></i> {{ activity.duration }}</span>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-2"
                                                style="background:#008cad; border-radius: 20px; text-align: center;">
                                                <router-link :to="`/activity-detail/${activity.slug}`"
                                                    title="View Activity" class="bt-outline-primary"
                                                    style="font-size: 20px; color:#fff;">
                                                    <span class="bi bi-eye"></span>
                                                </router-link>
                                            </div>
                                            <div class="col-md-8"></div>
                                            <div class="col-md-2"
                                                :style="{ background: activity.is_wishlist === 1 ? 'red' : '#008cad', borderRadius: '20px', textAlign: 'center' }"
                                                @click="activity.is_wishlist === 1 ? removeWishlist(activity) : toggleWishlist(activity)">
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