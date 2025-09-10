<script setup>
import { onMounted, ref, computed } from 'vue';
import api from '@/api';
import { useCurrencyStore } from "@/store/currency";
import { useServiceStore } from "@/store/service";
import { useRouter } from 'vue-router';

const currency = useCurrencyStore();
const serviceStore = useServiceStore()

const activities = ref([]);
const tours = ref([]);
const testimonials = ref([]);
const loading = ref(true);
const categories = ref([]);
const destinations = ref([]);

const router = useRouter();
const selectedDestination = ref('');
const selectedCategory = ref('');

function goToDestinations() {
    router.push({
        path: '/destinations',
        query: {
            destination: selectedDestination.value || '',
            category: selectedCategory.value || ''
        }
    });
}


const services = computed(() => serviceStore.services);
onMounted(async () => {
    await fetchData();
    await commonData();
});
async function commonData() {
    try {
        // Run multiple APIs in parallel
        const [toursRes, categoriesRes] = await Promise.all([
            api.get('/tour-list'),
            api.get('/tour-category-list')
        ]);

        if (toursRes.data?.Success) {
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
async function fetchData() {
    try {
        const res = await api.get('/web');

        if (res.data?.Success) {
            activities.value = res.data.Data.activities || [];
            tours.value = res.data.Data.tours || [];
            testimonials.value = res.data.Data.testimonials || [];
        }

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <main class="main">

        <!-- Travel Hero Section -->
        <section id="travel-hero" class="travel-hero section dark-background">

            <div class="hero-background">
                <video>
                    <source src="/assets/img/travel/video-2.mp4" type="video/mp4">
                </video>
                <div class="hero-overlay"></div>
            </div>

            <div class="container position-relative">
                <div class="row align-items-center">
                    <div class="col-lg-7">
                        <div class="hero-text" data-aos="fade-up" data-aos-delay="100">
                            <h1 class="hero-title">Discover Your Perfect Journey</h1>
                            <p class="hero-subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                exercitation.</p>
                            <div class="hero-buttons">
                                <a href="#" class="btn btn-primary me-3">Start Exploring</a>
                                <a href="#" class="btn btn-outline">Browse Tours</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-5">
                        <div class="booking-form-wrapper" data-aos="fade-left" data-aos-delay="200">
                            <div class="booking-form">
                                <h3 class="form-title">Plan Your Adventure</h3>
                                <form @submit.prevent="goToDestinations">
                                    <div class="form-group mb-3">
                                        <label for="destination">Destination</label>
                                        <select v-model="selectedDestination" class="form-select">
                                            <option disabled value="">Choose your destination</option>
                                            <option v-for="destination in destinations" :key="destination"
                                                :value="destination.id">{{ destination.name }}</option>
                                        </select>
                                    </div>
                                    <div class="form-group mb-3">
                                        <label for="checkin">Departure Date</label>
                                        <input type="date" name="checkin" id="checkin" class="form-control">
                                    </div>
                                    <div class="form-group mb-3">
                                        <label for="adults">Adults</label>
                                        <select name="adults" id="adults" class="form-select">
                                            <option value="1">1 Adult</option>
                                            <option value="2">2 Adults</option>
                                            <option value="3">3 Adults</option>
                                            <option value="4">4+ Adults</option>
                                        </select>
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="tour-type">Tour Type</label>
                                        <select v-model="selectedCategory" class="form-select">
                                            <option disabled value="">Select tour type</option>
                                            <option v-for="cat in categories" :key="cat.id" :value="cat.slug || cat.id">
                                                {{ cat.name }}
                                            </option>
                                        </select>
                                    </div>

                                    <button type="submit" class="btn btn-primary w-100">Find Your Perfect Trip</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section><!-- /Travel Hero Section -->

        <!-- Why Us Section -->
        <section id="why-us" class="why-us section">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row align-items-center mb-5">
                    <div class="col-lg-6" data-aos="fade-right" data-aos-delay="200">
                        <div class="content">
                            <h3>Explore the World with Confidence</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                                ut labore et
                                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                nisi ut aliquip
                                ex ea commodo consequat.</p>
                            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                                nulla pariatur.
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                mollit anim id est
                                laborum.</p>
                            <div class="stats-row">
                                <div class="stat-item">
                                    <span data-purecounter-start="0" data-purecounter-end="1200"
                                        data-purecounter-duration="2" class="purecounter">0</span>
                                    <div class="stat-label">Happy Travelers</div>
                                </div>
                                <div class="stat-item">
                                    <span data-purecounter-start="0" data-purecounter-end="85"
                                        data-purecounter-duration="2" class="purecounter">0</span>
                                    <div class="stat-label">Countries Covered</div>
                                </div>
                                <div class="stat-item">
                                    <span data-purecounter-start="0" data-purecounter-end="15"
                                        data-purecounter-duration="2" class="purecounter">0</span>
                                    <div class="stat-label">Years Experience</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6" data-aos="fade-left" data-aos-delay="300">
                        <div class="about-image">
                            <img src="/assets/img/travel/showcase-8.webp" alt="Travel Experience"
                                class="img-fluid rounded-4">
                            <div class="experience-badge">
                                <div class="experience-number">15+</div>
                                <div class="experience-text">Years of Excellence</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </section>
        <!-- /Why Us Section -->

        <!-- Featured Destinations Section -->
        <section id="featured-destinations" class="featured-destinations section" v-if="activities.length > 2">

            <!-- Section Title -->
            <div class="container section-title" data-aos="fade-up">
                <h2>Featured Activities</h2>
                <div><span>Check Our</span> <span class="description-title">Featured Activities</span></div>
            </div><!-- End Section Title -->

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row">
                    <!-- First Activity (Big Column) -->
                    <div class="col-lg-6" v-if="activities.length > 0" data-aos="zoom-in" data-aos-delay="200">
                        <div class="featured-destination">
                            <div class="destination-overlay">
                                <img :src="activities[0].thumbnail_url" :alt="activities[0].title" class="img-fluid">
                                <div class="destination-info">
                                    <span
                                        v-for="(tag, idx) in (activities[0].tags ? activities[0].tags.split(',') : [])"
                                        :key="idx" class="destination-tag me-2">
                                        {{ tag.trim() }}
                                    </span>
                                    <h3 class="one-line">{{ activities[0]?.title }}</h3>
                                    <p class="location"><i class="bi bi-geo-alt-fill"></i> {{
                                        activities[0]?.destination?.name }}
                                    </p>
                                    <p class="description one-line">{{ activities[0]?.short_description }}</p>
                                    <div class="destination-meta">
                                        <div class="tours-count">
                                            <i class="bi bi-collection"></i>
                                            <span>{{ activities[0]?.activity_date.length }}</span>
                                        </div>
                                        <div class="rating">
                                            <i class="bi bi-star-fill"></i>
                                            <span>{{ activities[0]?.average_rating }} ({{
                                                activities[0]?.activity_reviews.length }})</span>
                                        </div>
                                    </div>
                                    <div class="price-info">
                                        <span class="starting-from">Starting from</span>
                                        <span class="amount">{{ currency.format(activities[0]?.activity_date[0].price)
                                            }}</span>
                                    </div>
                                    <router-link :to="`/activity-detail/${activities[0]?.slug}`" class="explore-btn">
                                        <span>Explore Now</span>
                                        <i class="bi bi-arrow-right"></i>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Next Three Activities -->
                    <div class="col-lg-6">
                        <div class="row g-3">
                            <div class="col-12" v-for="(activity, index) in activities.slice(1, 4)" :key="index"
                                :data-aos="'fade-left'" :data-aos-delay="300 + (index * 100)">
                                <div class="compact-destination">
                                    <div class="destination-image">
                                        <img :src="activity?.thumbnail_url" :alt="activity?.title" class="img-fluid">
                                        <div v-for="(tag, idx) in (activity?.tags ? activity?.tags.split(',') : [])"
                                            :key="idx" class="badge-offer">
                                            {{ tag.trim() }}
                                        </div>
                                    </div>
                                    <div class="destination-details">
                                        <h4 class="one-line">{{ activity?.title }}</h4>
                                        <p class="location"><i class="bi bi-geo-alt"></i> {{ activity?.destination?.name
                                            }}</p>
                                        <p class="brief one-line">{{ activity?.short_description }}</p>
                                        <div class="stats-row">
                                            <span class="tour-count"><i class="bi bi-calendar-check"></i> {{
                                                activity?.activity_date.length }}</span>
                                            <span class="rating"><i class="bi bi-star-fill"></i> {{
                                                activity?.average_rating
                                                }}</span>
                                            <span class="price">from {{
                                                currency.format(activity?.activity_date[0].price) }}</span>
                                        </div>
                                        <router-link :to="`/activity-detail/${activity?.slug}`" class="quick-link">View
                                            Details <i class="bi bi-chevron-right"></i></router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </section><!-- /Featured Destinations Section -->

        <!-- Featured Tours Section -->
        <section id="featured-tours" class="featured-tours section" v-if="tours.length">

            <!-- Section Title -->
            <div class="container section-title" data-aos="fade-up">
                <h2>Featured Tours</h2>
                <div><span>Check Our</span> <span class="description-title">Featured Tours</span></div>
            </div><!-- End Section Title -->

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row gy-4">
                    <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200" v-for="tour in tours">
                        <div class="tour-card">
                            <div class="tour-image">
                                <img :src="tour?.thumbnail_url" :alt="tour?.title" class="img-fluid" loading="lazy">
                                <div class="tour-badge" v-for="(tag, idx) in (tour?.tags ? tour?.tags.split(',') : [])"
                                    :key="idx">{{ tag.trim() }}</div>
                                <div class="tour-price">{{
                                    currency.format((tour?.discount_price > 0) ? tour?.discount_price : tour?.price) }}
                                </div>
                            </div>
                            <div class="tour-content">
                                <h4 class="one-line">{{ tour?.title }}</h4>
                                <div class="tour-meta">
                                    <span class="duration"><i class="bi bi-clock"></i> {{ tour?.duration }}</span>
                                    <span class="group-size"><i class="bi bi-people"></i> Max {{ tour?.group_size
                                        }}</span>
                                </div>
                                <p class="one-line" v-html="tour?.short_description"></p>
                                <div class="tour-highlights">
                                    <span v-for="(tag, index) in tour?.tags.split(',')" :key="index">
                                        {{ tag.trim() }}
                                    </span>
                                </div>
                                <div class="tour-action">
                                    <router-link :to="`/tour-detail/${tour.slug}`" class="btn-book">Book
                                        Now</router-link>

                                    <div class="tour-rating">
                                        <span v-for="n in 5" :key="n">
                                            <i v-if="n <= Math.round(tour?.average_rating)"
                                                class="bi bi-star-fill text-warning"></i>
                                            <i v-else class="bi bi-star text-muted"></i>
                                        </span>
                                        <span>{{ Number(tour?.average_rating).toFixed(2) }} ( {{
                                            tour?.tour_reviews.length }} )</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div><!-- End Tour Item -->

                </div>

                <div class="text-center mt-5" data-aos="fade-up" data-aos-delay="500">
                    <router-link :to="`/tours`" class="btn-view-all">View All Tours</router-link>
                </div>

            </div>

        </section><!-- /Featured Tours Section -->

        <!-- Testimonials Home Section -->
        <section id="testimonials-home" class="testimonials-home section" v-if="testimonials.length">

            <!-- Section Title -->
            <div class="container section-title" data-aos="fade-up">
                <h2>Testimonials</h2>
                <div><span>What Our Customers</span> <span class="description-title">Are Saying</span></div>
            </div><!-- End Section Title -->

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="swiper init-swiper">
                    <div class="swiper-wrapper">

                        <div class="swiper-slide" v-for="testimonial in testimonials">
                            <div class="testimonial-item">
                                <p>
                                    <i class="bi bi-quote quote-icon-left"></i>
                                    <span v-html="testimonial?.message"></span>
                                    <i class="bi bi-quote quote-icon-right"></i>
                                </p>
                                <img :src="testimonial.image_url ? testimonial.image_url : '/assets/img/person/demoUser.png'"
                                    class="testimonial-img" alt="">
                                <h3>{{ testimonial?.name }}</h3>
                                <h4>{{ testimonial?.profession }}</h4>
                            </div>
                        </div><!-- End testimonial item -->

                    </div>
                    <div class="swiper-pagination"></div>
                </div>

            </div>

        </section><!-- /Testimonials Home Section -->

        <!-- Call To Action Section -->
        <section id="call-to-action" class="call-to-action section light-background">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="hero-content" data-aos="zoom-in" data-aos-delay="200">
                    <div class="content-wrapper">
                        <div class="badge-wrapper">
                            <span class="promo-badge">Limited Time Offer</span>
                        </div>
                        <h2>Discover Your Next Adventure</h2>
                        <p>Unlock incredible destinations with our specially curated travel packages. From exotic
                            beaches to
                            mountain peaks, your perfect getaway awaits.</p>

                        <div class="action-section">
                            <div class="main-actions">
                                <router-link :to="`/tours`" class="btn btn-explore">
                                    <i class="bi bi-compass"></i>
                                    Explore Now
                                </router-link>
                                <router-link :to="`/destinations`" class="btn btn-deals">
                                    <i class="bi bi-percent"></i>
                                    View Deals
                                </router-link>
                            </div>

                            <div class="quick-contact">
                                <span class="contact-label">Need help choosing?</span>
                                <a href="tel:+1555123456" class="contact-link">
                                    <i class="bi bi-telephone"></i>
                                    Call +1 (555) 123-456
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="visual-element">
                        <img src="/assets/img/travel/showcase-3.webp" alt="Travel Adventure" class="hero-image"
                            loading="lazy">
                        <div class="image-overlay">
                            <div class="stat-item">
                                <span class="stat-number">500+</span>
                                <span class="stat-label">Destinations</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">10K+</span>
                                <span class="stat-label">Happy Travelers</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="newsletter-section" data-aos="fade-up" data-aos-delay="300">
                    <div class="newsletter-card">
                        <div class="newsletter-content">
                            <div class="newsletter-icon">
                                <i class="bi bi-envelope-heart"></i>
                            </div>
                            <div class="newsletter-text">
                                <h3>Stay in the Loop</h3>
                                <p>Get exclusive travel deals and destination guides delivered to your inbox</p>
                            </div>
                        </div>

                        <form class="php-email-form newsletter-form" action="forms/newsletter.php" method="post">
                            <div class="form-wrapper">
                                <input type="email" name="email" class="email-input" placeholder="Your email address">
                                <button type="submit" class="subscribe-btn">
                                    <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>

                            <div class="loading">Loading</div>
                            <div class="error-message"></div>
                            <div class="sent-message">Welcome aboard! Check your email for exclusive offers.</div>

                            <div class="trust-indicators">
                                <i class="bi bi-lock"></i>
                                <span>We protect your privacy. Unsubscribe anytime.</span>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="benefits-showcase" data-aos="fade-up" data-aos-delay="400">
                    <div class="benefits-header">
                        <h3>Why Choose Our Adventures</h3>
                        <p>Experience the difference with our premium travel services</p>
                    </div>

                    <div class="benefits-grid">
                        <div v-for="(service, index) in services" class="benefit-card" data-aos="flip-left"
                            data-aos-delay="450">
                            <div class="benefit-visual">
                                <div class="benefit-icon-wrap">
                                    <i class="bi bi-heart"></i>
                                </div>
                                <div class="benefit-pattern"></div>
                            </div>
                            <div class="benefit-content">
                                <h4>{{ service?.name }}</h4>
                                <!-- <p v-html="service?.description">
                                </p> -->
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </section><!-- /Call To Action Section -->

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
