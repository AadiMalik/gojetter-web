<script setup>
import { useAuthStore } from '@/store/auth'
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
const activity = ref(null)
const related_activity = ref([])
const selectedDateId = ref(null)
const selectedTimeSlotId = ref(null)
const quantity = ref(1)

const token = localStorage.getItem('token')

const selectedDate = computed(() => {
      return activity.value?.activity_date?.find(d => d.id === selectedDateId.value) || null
})

const availableTimeSlots = computed(() => {
      return selectedDate.value?.activity_time_slot || []
})

const addToCart = async () => {
      if (!token) {
            toast.error("Please login first.")
            router.push('/login')
            return
      }
      if (!selectedDate.value) {
            toast.error("Please select a date.")
            return
      }
      if (!selectedTimeSlotId.value) {
            toast.error("Please select a time slot.")
            return
      }
      const slot = availableTimeSlots.value.find(s => s.id === selectedTimeSlotId.value)
      if (!slot || slot.available_seats < quantity.value) {
            toast.error("Not enough seats available.")
            return
      }
      const auth = useAuthStore()
      const user = computed(() => auth.user)

      function logout() {
            auth.logout()
      }
      try {
            const res = await api.post("/save-cart", {
                  activity_id: activity.value.id,
                  activity_date_id: selectedDate.value.id,
                  activity_time_slot_id: selectedTimeSlotId.value,
                  quantity: quantity.value
            },
                  {
                        headers: {
                              Authorization: `Bearer ${token}`
                        }
                  })
            if (res.data?.Success) {
                  toast.success(res.data?.Message)
                  router.push("/cart")
            } else {
                  toast.error(res.data?.Message || "Failed to add to cart")
            }
      } catch (err) {
            if (err.response?.status === 401) {
                  // logout logic
                  logout()
                  toast.error("Your session has expired. Please login again.")
                  router.push("/login")
            } else {
                  toast.error("Error while adding to cart")
            }
      }
}

const formatDate = (dateStr) => {
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      return new Date(dateStr).toLocaleDateString('en-GB', options)
}
const formatTime = (dateStr) => {
      return dayjs(dateStr).fromNow()
}

const isPastCutoff = (date) => {
      const start = new Date(date.date)
      const cutoffDate = new Date(start)
      cutoffDate.setDate(start.getDate() - (date.cut_off_days || 0))

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return today > cutoffDate
}

/* -------------------------
   ⭐ Fetch Activity + Related Activity
-------------------------- */
const fetchActivity = async () => {
      const slug = route.params.slug
      if (!slug) {
            router.push('/activity')
            return
      }

      loading.value = true
      try {
            const res = await api.get(`/activity-by-slug/${slug}`)
            if (res.data?.Success && res.data?.Data) {
                  activity.value = res.data.Data.detail
                  // limit to 3 related activity
                  related_activity.value = res.data.Data.related_activities.slice(0, 3)
            } else {
                  router.push('/activity')
            }
      } catch (error) {
            console.error(error)
            router.push('/activity')
      } finally {
            loading.value = false
      }
}

onMounted(fetchActivity)

// 👀 Watch for route slug change
watch(
      () => route.params.slug,
      () => {
            fetchActivity()
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
            const res = await api.post("/save-activity-review", {
                  activity_id: activity.value?.id,
                  rating: form.value.rating,
                  comment: form.value.comment
            })

            if (res.data?.Success && res.data?.Data) {
                  // Push the new review into the same array
                  activity.value.activity_reviews.unshift(res.data.Data)

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
                  :style="{ backgroundImage: `url(${activity?.thumbnail_url})` }">
                  <div class="container position-relative">
                        <h1>{{ activity?.title }}</h1>
                        <p v-html="activity?.short_description"></p>
                        <nav class="breadcrumbs">
                              <ol>
                                    <li><router-link to="/">Home</router-link></li>
                                    <li class="current">Activity Detail</li>
                              </ol>
                        </nav>
                  </div>
            </div><!-- End Page Title -->

            <!-- Travel Tour Details Section -->
            <section id="travel-tour-details" class="travel-tour-details section" style="padding: 60px 0px 0;">

                  <div class="container" data-aos="fade-up" data-aos-delay="600">
                        <!-- Tour Overview -->
                        <div class="tour-info-row row text-center mb-4">
                              <div class="col-6 col-md-3 mb-3" v-if="activity?.duration">
                                    <div class="info-box">
                                          <i class="bi bi-clock"></i>
                                          <h6>Duration</h6>
                                          <p>{{ activity?.duration }}</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="activity?.group_size">
                                    <div class="info-box">
                                          <i class="bi bi-people"></i>
                                          <h6>Group Size</h6>
                                          <p>{{ activity?.group_size }} people</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="activity?.age_limit">
                                    <div class="info-box">
                                          <i class="bi bi-person-badge"></i>
                                          <h6>Age Limit</h6>
                                          <p>{{ activity?.age_limit }}+</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="activity?.languages">
                                    <div class="info-box">
                                          <i class="bi bi-translate"></i>
                                          <h6>Languages</h6>
                                          <p>{{ activity?.languages }}</p>
                                    </div>
                              </div>
                              <div class="col-6 col-md-3 mb-3" v-if="activity?.activity_type">
                                    <div class="info-box">
                                          <i class="bi bi-people"></i>
                                          <h6>Activity Type</h6>
                                          <p>{{ activity?.activity_type }}</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="activity?.destination_id">
                                    <div class="info-box">
                                          <i class="bi bi-geo-alt"></i>
                                          <h6>Destination</h6>
                                          <p>{{ activity?.destination?.name }}</p>
                                    </div>
                              </div>

                              <div class="col-6 col-md-3 mb-3" v-if="activity?.difficulty_level">
                                    <div class="info-box">
                                          <i class="bi bi-graph-up"></i>
                                          <h6>Difficulty</h6>
                                          <p>{{ activity?.difficulty_level }}</p>
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
                                                      <div class="tour-tags" v-if="activity?.tags">
                                                            <span v-for="(tag, index) in activity.tags.split(',')"
                                                                  :key="index" class="badge bg-primary me-2">
                                                                  {{ tag.trim() }}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>
                                          <div class="row mt-2 mb-3">
                                                <div class="stars">
                                                      <span v-for="n in 5" :key="n">
                                                            <i v-if="n <= Math.round(activity?.average_rating)"
                                                                  class="bi bi-star-fill text-warning"></i>
                                                            <i v-else class="bi bi-star text-muted"></i>
                                                      </span>
                                                      <b style="margin-left: 5px;">{{
                                                            Number(activity?.average_rating).toFixed(2) }}</b>
                                                      <span> ( {{ activity?.activity_reviews.length }} Reviews )</span>
                                                </div>
                                          </div>
                                          <h4>Overview</h4>
                                          <hr>
                                          <p v-html="activity?.overview"></p>
                                          <br> <br>
                                          <h4>Short Description</h4>
                                          <hr>
                                          <p v-html="activity?.short_description"></p>
                                    </div>
                                    <div class="col-lg-4">
                                          <div class="tour-highlights">
                                                <h3>Available Dates</h3>

                                                <!-- Dates -->
                                                <label v-for="date in activity?.activity_date" :key="date.id"
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
                                                      {{ formatDate(date.date) }}
                                                      <b>${{ (date.discount_price &&
                                                            date.discount_price > 0
                                                            ? currency.format(date.discount_price)
                                                            : currency.format(date.price))
                                                            }}</b>

                                                      <span v-if="isPastCutoff(date)" class="text-danger ms-2">(Booking
                                                            closed)</span>
                                                </label>
                                                <!-- <label v-for="date in activity?.activity_date" :key="date.id"
                                                      class="p-2 mb-2 rounded w-100 d-block"
                                                      :class="[selectedDateId === date.id ? 'border border-primary bg-primary text-white' : 'border border-success']"
                                                      style="cursor:pointer">
                                                      <input type="radio" name="tour_date" :value="date.id"
                                                            v-model="selectedDateId" class="d-none" />
                                                      {{ date.date }}
                                                      <span v-if="date.discount_price > 0" class="ms-2 text-success">
                                                            {{ date.discount_price }} (Discounted)
                                                      </span>
                                                      <span v-else class="ms-2 text-muted">
                                                            {{ date.price }}
                                                      </span>
                                                </label> -->

                                                <!-- Time Slots (only show if date is picked) -->
                                                <div v-if="selectedDate">
                                                      <h5 class="mt-3">Time Slots</h5>
                                                      <label v-for="slot in availableTimeSlots" :key="slot.id"
                                                            class="p-2 mb-2 rounded w-100 d-block" :class="[
                                                                  slot.available_seats >= quantity
                                                                        ? (selectedTimeSlotId === slot.id ? 'border border-primary bg-primary text-white' : 'border border-success')
                                                                        : 'border border-danger bg-light text-muted'
                                                            ]"
                                                            :style="{ cursor: slot.available_seats >= quantity ? 'pointer' : 'not-allowed' }">
                                                            <input type="radio" name="time_slot" :value="slot.id"
                                                                  v-model="selectedTimeSlotId"
                                                                  :disabled="slot.available_seats < quantity"
                                                                  class="d-none" />
                                                            {{ slot.start_time }} - {{ slot.end_time }}
                                                            <span class="ms-2">({{ slot.available_seats }} seats
                                                                  left)</span>
                                                      </label>
                                                </div>

                                                <!-- Quantity -->
                                                <div class="mt-3">
                                                      <label>Quantity:</label>
                                                      <input type="number" min="1" v-model="quantity"
                                                            class="form-control" />
                                                </div>

                                                <!-- Add to Cart -->
                                                <button @click="addToCart" class="form-control text-white mt-3"
                                                      style="background-color:#008cad;">
                                                      Add to Cart
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                        <!-- Inclusions -->
                        <div class="tour-inclusions" data-aos="fade-up" data-aos-delay="600">
                              <div class="row">
                                    <div class="col-md-8">
                                          <div class="row">
                                                <div class="col-lg-6" v-if="activity?.activity_inclusion?.length">
                                                      <div class="included-section">
                                                            <h3><i class="bi bi-check-circle-fill"></i> What's Included
                                                            </h3>
                                                            <ul class="inclusion-list included"
                                                                  v-for="item in activity?.activity_inclusion"
                                                                  :key="item.id">
                                                                  <li><i class="bi bi-check"></i> {{ item.item }}</li>
                                                            </ul>
                                                      </div>
                                                </div>
                                                <div class="col-lg-6" v-if="activity?.activity_exclusion?.length">
                                                      <div class="excluded-section">
                                                            <h3><i class="bi bi-x-circle-fill"></i> What's Not Included
                                                            </h3>
                                                            <ul class="inclusion-list excluded"
                                                                  v-for="item in activity?.activity_exclusion"
                                                                  :key="item.id">
                                                                  <li><i class="bi bi-x"></i> {{ item.item }}</li>
                                                            </ul>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                                    <div class="col-md-4" v-if="activity?.activity_not_suitable.length">
                                          <div class="card">
                                                <div class="card-body">
                                                      <h4>Not Suitable</h4>
                                                      <hr>
                                                      <ul>
                                                            <li v-for="item in activity?.activity_not_suitable">
                                                                  {{ item.item }}
                                                            </li>
                                                      </ul>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                        </div>
                        <!-- Booking Form -->
                        <div class="booking-section" id="booking" data-aos="fade-up" data-aos-delay="600">
                              <div class="row">
                                    <div class="col-md-8">
                                          <h4>Description</h4>
                                          {{ activity?.full_description }}
                                    </div>
                                    <div class="col-md-4" v-if="activity?.activity_policy.length">
                                          <div class="card">
                                                <div class="card-body">
                                                      <h4>Policy</h4>
                                                      <hr>
                                                      <div class="row">
                                                            <div class="col-md-12"
                                                                  v-for="item in activity?.activity_policy">
                                                                  <b>{{ item?.title }}</b>
                                                                  <p>{{ item?.description }}</p>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <!-- Supports -->
                        <div class="tour-gallery" data-aos="fade-up" data-aos-delay="600"
                              v-if="activity?.activity_support.length">
                              <h3>Supports</h3>
                              <hr>
                              <div class="row">
                                    <div class="col-md-12" v-for="item in activity?.activity_support">
                                          <b>{{ item.contact_type }}</b>
                                          <p>{{ item.contact_info }}</p>
                                    </div>
                              </div>
                        </div>
                        <!-- Gallery -->
                        <div class="tour-gallery" data-aos="fade-up" data-aos-delay="600"
                              v-if="activity?.activity_image.length">
                              <h3>Gallery</h3>
                              <hr>
                              <div class="gallery-grid">
                                    <div class="gallery-item" v-for="item in activity?.activity_image" :key="item.id">
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
                                    <h5>({{ activity?.activity_reviews.length }}) Reviews</h5>
                                    <hr>
                                    <div style="max-height: 400px; overflow: auto;">
                                          <div v-if="activity?.activity_reviews.length === 0">No reviews yet.</div>

                                          <div v-for="rev in activity?.activity_reviews" :key="rev.id"
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
                                    <h4 class="section-subtitle mt-4">Related Activities</h4>
                                    <hr>
                                    <div v-if="loading" class="text-center">Loading related activities...</div>
                                    <div v-else-if="!related_activity.length" class="text-center">No related activities
                                          found.
                                    </div>
                                    <div class="row">
                                          <div class="col-lg-4 col-md-6 mb-4" v-for="activity in related_activity"
                                                :key="activity.id">
                                                <router-link :to="`/activity-detail/${activity.slug}`">
                                                      <div class="tour-card">
                                                            <div class="tour-image">
                                                                  <img :src="activity.thumbnail_url"
                                                                        alt="Activity image" class="img-fluid" />
                                                                  <div class="tour-price">
                                                                        <template
                                                                              v-if="Array.isArray(activity?.activity_date) && activity.activity_date.length > 0">
                                                                              <template
                                                                                    v-if="activity.activity_date[0].discount_price && activity.activity_date[0].discount_price > 0">
                                                                                    <del class="text-danger">{{
                                                                                          currency.format(activity.activity_date[0].price)
                                                                                          }}</del> <br>
                                                                                    <span class="text-white">{{
                                                                                          currency.format(activity.activity_date[0].discount_price)
                                                                                          }}</span>
                                                                              </template>
                                                                              <template v-else>
                                                                                    {{ currency.format(activity.activity_date[0].price)
                                                                                    }}
                                                                              </template>
                                                                        </template>
                                                                        <template v-else>
                                                                              {{currency.format(0)}}
                                                                        </template>
                                                                  </div>
                                                            </div>
                                                            <div class="tour-content">
                                                                  <h4 class="one-line">{{ activity.title }}</h4>
                                                                  <p v-html="activity.short_description"
                                                                        class="one-line">
                                                                  </p>
                                                                  <div class="tour-details">
                                                                        <span><i class="bi bi-clock"></i> {{
                                                                              activity.duration }}</span>
                                                                  </div>
                                                                  <div class="row">
                                                                        <div class="col-md-2"
                                                                              style="background:#008cad; border-radius: 20px; text-align: center;">
                                                                              <router-link
                                                                                    :to="`/activity-detail/${activity.slug}`"
                                                                                    title="View Activity"
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