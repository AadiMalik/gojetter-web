<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useCurrencyStore } from "@/store/currency"

const currency = useCurrencyStore()

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const tour = ref(null)
const related_tours = ref([])
const selectedDateId = ref(null)
const adults = ref(1)

// Active FAQ index
const activeFaq = ref(null)
const toggleFaq = (index) => {
      activeFaq.value = activeFaq.value === index ? null : index
}

const selectedDate = computed(() => {
      return tour.value?.tour_date?.find(d => d.id === selectedDateId.value) || null
})

const formatDate = (dateStr) => {
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      return new Date(dateStr).toLocaleDateString('en-GB', options)
}
const formatTime = (dateStr) => {
      return dayjs(dateStr).fromNow()
}

const isPastCutoff = (date) => {
      const start = new Date(date.start_date)
      const cutoffDate = new Date(start)
      cutoffDate.setDate(start.getDate() - (date.cut_off_days || 0))

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return today > cutoffDate
}

const bookNow = () => {
      if (!selectedDate.value) {
            toast.error('Please select a date.')
            return
      }

      if (isPastCutoff(selectedDate.value)) {
            toast.error(`Booking closed. You must book at least ${selectedDate.value.cut_off_days} day(s) before the start date.`)
            return
      }

      router.push({
            path: '/checkout-tour',
            query: {
                  date_id: selectedDate.value.id,
                  tour_id: selectedDate.value.tour_id,
                  adults: selectedDate.value.price_type === 'per_person' ? adults.value : 1
            }
      })
}

/* -------------------------
   ⭐ Fetch Tour + Related Tours
-------------------------- */
const fetchTour = async () => {
      const slug = route.params.slug
      if (!slug) {
            router.push('/tours')
            return
      }

      loading.value = true
      try {
            const res = await api.get(`/tour-by-slug/${slug}`)
            if (res.data?.Success && res.data?.Data) {
                  tour.value = res.data.Data.detail
                  // limit to 3 related tours
                  related_tours.value = res.data.Data.related_tours.slice(0, 3)
            } else {
                  router.push('/tours')
            }
      } catch (error) {
            console.error(error)
            router.push('/tours')
      } finally {
            loading.value = false
      }
}

onMounted(fetchTour)

// 👀 Watch for route slug change
watch(
      () => route.params.slug,
      () => {
            fetchTour()
            window.scrollTo({
                  top: 0,
                  behavior: 'smooth' // smooth scrolling
            })
      }
)

/* -------------------------
   ⭐ Reviews (inline refresh)
-------------------------- */
const form = ref({
      rating: null,
      comment: ""
})

const postReview = async () => {
      if (!form.value.rating) {
            toast.error("Please select a rating.")
            return
      }
      try {
            const res = await api.post("/save-tour-review", {
                  tour_id: tour.value?.id,
                  rating: form.value.rating,
                  comment: form.value.comment
            })

            if (res.data?.Success && res.data?.Data) {
                  // Push the new review into the same array
                  tour.value.tour_reviews.unshift(res.data.Data)

                  // Reset form
                  form.value.rating = null
                  form.value.comment = ""
            } else {
                  toast.error(res.data?.Message || "Something went wrong")
            }
      } catch (err) {
            console.error(err)
            if (err.response?.status === 401) {
                  router.push({
                        path: "/login",
                        query: { redirect: route.fullPath }
                  })
            }
            toast.error("Error while saving review")
      }
}
</script>

<template>
      <main class="main">
            <!-- Page Title -->
            <div class="page-title dark-background" data-aos="fade"
                  :style="{ backgroundImage: `url(${tour?.thumbnail_url})` }">
                  <div class="container position-relative">
                        <h1>{{ tour?.title }}</h1>
                        <p v-html="tour?.short_description"></p>
                        <nav class="breadcrumbs">
                              <ol>
                                    <li><router-link to="/">Home</router-link></li>
                                    <li class="current">Tour Detail</li>
                              </ol>
                        </nav>
                  </div>
            </div><!-- End Page Title -->

            <!-- Travel Tour Details Section -->
            <section id="travel-tour-details" class="travel-tour-details section" style="padding: 60px 0px 0;">

                  <div class="container" data-aos="fade-up" data-aos-delay="600">
                        <!-- Tour Overview -->
                        <div class="tour-info-row row text-center mb-4">
                              <div class="col-6 col-md-3 mb-3" v-if="tour?.duration">
                                    <div class="info-box">
                                          <i class="bi bi-clock"></i>
                                          <h6>Duration</h6>
                                          <p>{{ tour?.duration }}</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="tour?.group_size">
                                    <div class="info-box">
                                          <i class="bi bi-people"></i>
                                          <h6>Group Size</h6>
                                          <p>{{ tour?.group_size }} people</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="tour?.age_limit">
                                    <div class="info-box">
                                          <i class="bi bi-person-badge"></i>
                                          <h6>Age Limit</h6>
                                          <p>{{ tour?.age_limit }}+</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="tour?.languages">
                                    <div class="info-box">
                                          <i class="bi bi-translate"></i>
                                          <h6>Languages</h6>
                                          <p>{{ tour?.languages }}</p>
                                    </div>
                              </div>
                              <div class="col-6 col-md-3 mb-3" v-if="tour?.tour_type">
                                    <div class="info-box">
                                          <i class="bi bi-people"></i>
                                          <h6>Tour Type</h6>
                                          <p>{{ tour?.tour_type }}</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="tour?.destination_id">
                                    <div class="info-box">
                                          <i class="bi bi-geo-alt"></i>
                                          <h6>Destination</h6>
                                          <p>{{ tour?.destination?.name }}</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="tour?.difficulty_level">
                                    <div class="info-box">
                                          <i class="bi bi-graph-up"></i>
                                          <h6>Difficulty</h6>
                                          <p>{{ tour?.difficulty_level }}</p>
                                    </div>
                              </div>
                              <!-- 
                              <div class="col-6 col-md-2">
                                    <div class="info-box">
                                          <i class="bi bi-tags"></i>
                                          <h6>Category</h6>
                                          <p>{{ tour?.tour_category?.name }}</p>
                                    </div>
                              </div> -->
                        </div>
                        <div class="tour-overview" data-aos="fade-up" data-aos-delay="600">
                              <div class="row">
                                    <div class="col-lg-8">
                                          <div class="row mt-2 mb-3">
                                                <div class="col-md-12">
                                                      <div class="tour-tags" v-if="tour?.tags">
                                                            <span v-for="(tag, index) in tour.tags.split(',')"
                                                                  :key="index" class="badge bg-primary me-2">
                                                                  {{ tag.trim() }}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>
                                          <div class="row mt-2 mb-3">
                                                <div class="stars">
                                                      <span v-for="n in 5" :key="n">
                                                            <i v-if="n <= Math.round(tour?.average_rating)"
                                                                  class="bi bi-star-fill text-warning"></i>
                                                            <i v-else class="bi bi-star text-muted"></i>
                                                      </span>
                                                      <b style="margin-left: 5px;">{{
                                                            Number(tour?.average_rating).toFixed(2) }}</b>
                                                      <span> ( {{ tour?.tour_reviews.length }} Reviews )</span>
                                                </div>
                                          </div>
                                          <h4>Overview</h4>
                                          <hr>
                                          <p v-html="tour?.overview"></p>
                                          <br> <br>
                                          <h4>Short Description</h4>
                                          <hr>
                                          <p v-html="tour?.short_description"></p>
                                    </div>
                                    <div class="col-lg-4">
                                          <div class="tour-highlights">
                                                <h3>Available Dates</h3>

                                                <label v-for="date in tour?.tour_date" :key="date.id"
                                                      class="p-2 mb-2 rounded w-100 d-block" :class="[
                                                            isPastCutoff(date)
                                                                  ? 'border border-danger bg-light text-muted'
                                                                  : selectedDateId === date.id
                                                                        ? 'border border-primary bg-primary text-white'
                                                                        : 'border border-success'
                                                      ]"
                                                      :style="{ cursor: isPastCutoff(date) ? 'not-allowed' : 'pointer' }">
                                                      <input type="radio" name="tour_date" :value="date.id"
                                                            v-model="selectedDateId" :disabled="isPastCutoff(date)"
                                                            class="d-none" />
                                                      {{ formatDate(date.start_date) }} - {{
                                                            formatDate(date.end_date) }} <br />
                                                      <b>{{ currency.format((date.discount_price &&
                                                            date.discount_price > 0
                                                            ? date.discount_price
                                                            : date.price))
                                                      }}</b>
                                                      {{ date.price_type === 'per_person' ? 'per person' : 'Group'
                                                      }}

                                                      <span v-if="isPastCutoff(date)" class="text-danger ms-2">(Booking
                                                            closed)</span>
                                                </label>

                                                <!-- Adults input if per_person -->
                                                <div v-if="selectedDate && selectedDate.price_type === 'per_person'"
                                                      class="mt-3">
                                                      <label>Number of Adults:</label>
                                                      <input type="number" min="1" v-model.number="adults"
                                                            class="form-control" />
                                                </div>

                                                <button @click="bookNow" class="form-control text-white mt-3"
                                                      style="background-color: #008cad;">
                                                      Book Now
                                                </button>
                                          </div>

                                    </div>

                              </div>
                        </div>

                        <!-- Itinerary -->
                        <div class="tour-itinerary" data-aos="fade-up" data-aos-delay="600">
                              <div class="row">
                                    <div class="col-md-8" v-if="tour?.tour_itinerary.length">
                                          <h3>Itinerary</h3>
                                          <hr>
                                          <div class="itinerary-timeline">
                                                <div class="itinerary-item" v-for="item in tour?.tour_itinerary"
                                                      :key="item.id">
                                                      <div class="day-number">Day {{ item.day_number }}</div>
                                                      <div class="day-content">
                                                            <h4>{{ item.title }}</h4>
                                                            <p v-html="item.description"></p>

                                                            <!-- Optional image if available -->
                                                            <div v-if="item.image_url" class="day-image">
                                                                  <img :src="item.image_url" :alt="item.title"
                                                                        style="width:100%; height:100%">
                                                            </div>

                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                                    <div class="col-lg-4" v-if="tour?.highlights">
                                          <div class="card">
                                                <div class="card-body">
                                                      <h4>Highlights</h4>
                                                      <hr>
                                                      <p v-html="tour?.highlights"></p>
                                                      <!-- <ul>
                                                      <li><i class="bi bi-check-circle"></i> 4-Star Boutique Hotels</li>
                                                      <li><i class="bi bi-check-circle"></i> Expert Local Guides</li>
                                                      <li><i class="bi bi-check-circle"></i> Daily Breakfast Included
                                                      </li>
                                                      <li><i class="bi bi-check-circle"></i> Small Group (Max 16)
                                                      </li>
                                                      <li><i class="bi bi-check-circle"></i> UNESCO World Heritage Sites
                                                      </li>
                                                      <li><i class="bi bi-check-circle"></i> Cultural Experiences</li>
                                                </ul> -->
                                                </div>
                                          </div>
                                          <br>
                                          <div class="card" v-if="tour?.tour_faq?.length">
                                                <div class="card-body">
                                                      <h4>Frequently Asked Questions</h4>
                                                      <hr>

                                                      <div v-for="(faq, index) in tour?.tour_faq" :key="index"
                                                            class="faq-item mb-2">
                                                            <div class="faq-question" @click="toggleFaq(index)">
                                                                  <span>{{ faq.question }}</span>
                                                                  <span
                                                                        :class="['arrow', { 'open': activeFaq === index }]">&#9662;</span>
                                                            </div>
                                                            <div v-if="activeFaq === index" class="faq-answer">
                                                                  {{ faq.answer }}
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <!-- Inclusions -->
                        <div class="tour-inclusions" data-aos="fade-up" data-aos-delay="600">
                              <div class="row">
                                    <div class="col-md-8">
                                          <div class="row">
                                                <div class="col-lg-6" v-if="tour?.tour_inclusion?.length">
                                                      <div class="included-section">
                                                            <h3><i class="bi bi-check-circle-fill"></i> What's Included
                                                            </h3>
                                                            <ul class="inclusion-list included"
                                                                  v-for="item in tour?.tour_inclusion" :key="item.id">
                                                                  <li><i class="bi bi-check"></i> {{ item.item }}</li>
                                                            </ul>
                                                      </div>
                                                </div>
                                                <div class="col-lg-6" v-if="tour?.tour_exclusion?.length">
                                                      <div class="excluded-section">
                                                            <h3><i class="bi bi-x-circle-fill"></i> What's Not Included
                                                            </h3>
                                                            <ul class="inclusion-list excluded"
                                                                  v-for="item in tour?.tour_exclusion" :key="item.id">
                                                                  <li><i class="bi bi-x"></i> {{ item.item }}</li>
                                                            </ul>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                                    <div class="col-md-4" v-if="tour?.tour_download.length">
                                          <div class="card">
                                                <div class="card-body">
                                                      <h4>Downloads</h4>
                                                      <hr>
                                                      <table class="table table-borderd" width="100%">
                                                            <thead>
                                                                  <tr>
                                                                        <th>
                                                                              File Type
                                                                        </th>
                                                                        <th>
                                                                              File
                                                                        </th>
                                                                  </tr>
                                                            </thead>
                                                            <tbody>
                                                                  <tr v-for="item in tour?.tour_download">
                                                                        <td>
                                                                              {{ item?.file_type }}
                                                                        </td>
                                                                        <td>
                                                                              <a :href="item?.file_path_url" download
                                                                                    class="btn btn-primary btn-sm">
                                                                                    Download
                                                                              </a>
                                                                        </td>
                                                                  </tr>
                                                            </tbody>
                                                      </table>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                        </div>
                        <!-- Booking Form -->
                        <div v-if="tour?.description" class="booking-section" id="booking" data-aos="fade-up"
                              data-aos-delay="600">
                              <h4>Description</h4>
                              {{ tour?.description }}
                        </div>

                        <!-- Gallery -->
                        <div class="tour-gallery" data-aos="fade-up" data-aos-delay="600"
                              v-if="tour?.tour_image.length">
                              <h3>Gallery</h3>
                              <hr>
                              <div class="gallery-grid">
                                    <div class="gallery-item" v-for="item in tour?.tour_image" :key="item.id">
                                          <a :href="item.image_url" class="glightbox">
                                                <img :src="item.image_url" :alt="item.title" class="img-fluid"
                                                      loading="lazy">
                                          </a>
                                    </div>
                              </div>
                        </div>
                        <hr>
                        <div class="row" data-aos="fade-up" data-aos-delay="600">
                              <div class="col-md-12">
                                    <div class="card">
                                          <div class="card-header">
                                                <h4>Add Review</h4>
                                          </div>
                                          <div class="card-body">
                                                <div class="row">
                                                      <div class="col-md-12">
                                                            <div class="rating">
                                                                  <input type="radio" name="rating" value="5"
                                                                        id="rating-5" v-model="form.rating">
                                                                  <label for="rating-5"></label>
                                                                  <input type="radio" name="rating" value="4"
                                                                        id="rating-4" v-model="form.rating">
                                                                  <label for="rating-4"></label>
                                                                  <input type="radio" name="rating" value="3"
                                                                        id="rating-3" v-model="form.rating">
                                                                  <label for="rating-3"></label>
                                                                  <input type="radio" name="rating" value="2"
                                                                        id="rating-2" v-model="form.rating">
                                                                  <label for="rating-2"></label>
                                                                  <input type="radio" name="rating" value="1"
                                                                        id="rating-1" v-model="form.rating">
                                                                  <label for="rating-1"></label>
                                                            </div>
                                                      </div>
                                                      <div class="col-md-12 mb-2">
                                                            <textarea v-model="form.comment" class="form-control"
                                                                  placeholder="Comment here*.." required></textarea>
                                                      </div>
                                                      <div class="col-md-8"></div>
                                                      <div class="col-md-4 mb-2 text-end">
                                                            <button @click="postReview"
                                                                  class="btn btn-primary form-control">Post</button>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                              <div class="col-md-12 mt-2">
                                    <h5>({{ tour?.tour_reviews.length }}) Reviews</h5>
                                    <hr>
                                    <div style="max-height: 400px; overflow: auto;">
                                          <div v-if="tour?.tour_reviews.length === 0">No reviews yet.</div>

                                          <div v-for="rev in tour?.tour_reviews" :key="rev.id"
                                                class="border p-2 mb-2 rounded">
                                                <div class="flex items-start gap-2 mb-3">
                                                      <!-- User Picture -->
                                                      <img src="/assets/img/person/demoUser.png" alt="User"
                                                            style="width: 50px; border-radius: 50px; float:left;" />

                                                      <!-- Right side (name + time + comment) -->
                                                      <div class="flex items-center gap-2" style="float: left;">
                                                            <strong style="margin-left:7px;">{{ rev.user?.name
                                                            }}</strong><br>
                                                            <small class="text-muted block" style="margin-left:7px;">{{
                                                                  formatTime(rev.created_at) }}</small>
                                                      </div> <br><br><br>


                                                      <div style="margin-left:5px;">
                                                            <span v-for="n in 5" :key="n">
                                                                  <i v-if="n <= rev.rating"
                                                                        class="bi bi-star-fill text-warning"></i>
                                                                  <i v-else class="bi bi-star text-muted"></i>
                                                            </span>
                                                            <p class="mt-1">{{ rev.comment }}</p>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                  </div>

            </section><!-- /Travel Tour Details Section -->
            <section id="travel-tours" class="travel-tours" style="padding: 0px !important;">
                  <div class="container" data-aos="fade-up" data-aos-delay="600">
                        <div class="row">
                              <div class="col-12">
                                    <h4 class="section-subtitle mt-4">Related Tours</h4>
                                    <hr>
                                    <div v-if="loading" class="text-center">Loading related tours...</div>
                                    <div v-else-if="!related_tours.length" class="text-center">No related tours found.
                                    </div>
                                    <div class="row">
                                          <div class="col-lg-4 col-md-6 mb-4" v-for="tour in related_tours"
                                                :key="tour.id">
                                                <router-link :to="`/tour-detail/${tour.slug}`">
                                                      <div class="tour-card">
                                                            <div class="tour-image">
                                                                  <img :src="tour.thumbnail_url" alt="Tour image"
                                                                        class="img-fluid" />
                                                                  <div class="tour-price">
                                                                        <template
                                                                              v-if="Array.isArray(tour?.tour_date) && tour.tour_date.length > 0">
                                                                              <template
                                                                                    v-if="tour.tour_date[0].discount_price && tour.tour_date[0].discount_price > 0">
                                                                                    <del class="text-danger">{{
                                                                                          currency.format(tour.tour_date[0].price)
                                                                                          }}</del> <br>
                                                                                    <span class="text-white">{{
                                                                                          currency.format(tour.tour_date[0].discount_price)
                                                                                          }}</span>
                                                                              </template>
                                                                              <template v-else>
                                                                                    {{ currency.format(tour.tour_date[0].price) }}
                                                                              </template>
                                                                        </template>
                                                                        <template v-else>
                                                                              {{currency.format(0)}}
                                                                        </template>
                                                                  </div>
                                                            </div>
                                                            <div class="tour-content">
                                                                  <h4 class="one-line">{{ tour.title }}</h4>
                                                                  <p v-html="tour.short_description" class="one-line">
                                                                  </p>
                                                                  <div class="tour-details">
                                                                        <span><i class="bi bi-clock"></i> {{
                                                                              tour.duration }}</span>
                                                                  </div>
                                                                  <div class="row">
                                                                        <div class="col-md-2"
                                                                              style="background:#008cad; border-radius: 20px; text-align: center;">
                                                                              <router-link
                                                                                    :to="`/tour-detail/${tour.slug}`"
                                                                                    title="View Tour"
                                                                                    class="bt-outline-primary"
                                                                                    style="font-size: 20px; color:#fff;">
                                                                                    <span class="bi bi-eye"></span>
                                                                              </router-link>
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </router-link>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </div>
            </section>
      </main>


</template>
<style>
.info-box {
      background: #fff;
      border: 1px solid #eee;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
}

.info-box i {
      font-size: 1.5rem;
      color: #007bff;
      margin-bottom: 5px;
}

.info-box h6 {
      font-weight: 600;
      margin-bottom: 3px;
}

.info-box p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
}

.info-box:hover {
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
}

.tour-tags .badge {
      font-size: 0.85rem;
      padding: 6px 12px;
      border-radius: 12px;
}

.faq-item {
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      overflow: hidden;
}

.faq-question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background-color: #f9f9f9;
      cursor: pointer;
      color: #008cad;
      font-weight: 500;
      text-decoration: none;
}

.faq-question:hover {
      background-color: #eef5ff;
}

.arrow {
      transition: transform 0.3s ease;
}

.arrow.open {
      transform: rotate(180deg);
}

.faq-answer {
      padding: 10px 14px;
      border-top: 1px solid #ccc;
      background-color: #fff;
      color: #555;
}

.rating {
      display: flex;
      width: 100%;
      justify-content: left;
      overflow: hidden;
      flex-direction: row-reverse;
      position: relative;
}

.rating-0 {
      filter: grayscale(100%);
}

.rating>input {
      display: none;
}

.rating>label {
      cursor: pointer;
      width: 40px;
      height: 40px;
      margin-top: auto;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='%23e3e3e3' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 76%;
      transition: 0.3s;
}

.rating>input:checked~label,
.rating>input:checked~label~label {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='%23fcd93a' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
}

.rating>input:not(:checked)~label:hover,
.rating>input:not(:checked)~label:hover~label {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='%23d8b11e' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
}


#rating-1:checked~.emoji-wrapper>.emoji {
      transform: translateY(-100px);
}

#rating-2:checked~.emoji-wrapper>.emoji {
      transform: translateY(-200px);
}

#rating-3:checked~.emoji-wrapper>.emoji {
      transform: translateY(-300px);
}

#rating-4:checked~.emoji-wrapper>.emoji {
      transform: translateY(-400px);
}

#rating-5:checked~.emoji-wrapper>.emoji {
      transform: translateY(-500px);
}
</style>