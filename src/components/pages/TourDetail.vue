<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const tour = ref(null)
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

// Function to check if booking is past cutoff
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
            alert('Please select a date.')
            return
      }

      if (isPastCutoff(selectedDate.value)) {
            alert(`Booking closed. You must book at least ${selectedDate.value.cut_off_days} day(s) before the start date.`)
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

onMounted(async () => {
      const slug = route.params.slug

      if (!slug) {
            router.push('/tours')
            return
      }
      try {
            const res = await api.get(`/tour-by-slug/${slug}`)
            if (res.data?.Success && res.data?.Data) {
                  tour.value = res.data.Data
            } else {
                  router.push('/tours')
            }
      } catch (error) {
            console.error(error)
            router.push('/tours')
      } finally {
            loading.value = false
      }
})
</script>




<template>
      <main class="main">

            <!-- Page Title -->
            <div class="page-title dark-background" data-aos="fade"
                  :style="{ backgroundImage: `url(${tour?.thumbnail_url})` }">
                  <div class="container position-relative">
                        <h1>{{ tour?.title }}</h1>
                        <p>{{ tour?.short_description }}</p>
                        <nav class="breadcrumbs">
                              <ol>
                                    <li><router-link to="/">Home</router-link></li>
                                    <li class="current">Tour Detail</li>
                              </ol>
                        </nav>
                  </div>
            </div><!-- End Page Title -->

            <!-- Travel Tour Details Section -->
            <section id="travel-tour-details" class="travel-tour-details section">

                  <div class="container" data-aos="fade-up" data-aos-delay="200">
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

                              <div class="col-6 col-md-3 mb-3" v-if="tour?.location">
                                    <div class="info-box">
                                          <i class="bi bi-geo-alt"></i>
                                          <h6>Location</h6>
                                          <p>{{ tour?.location }}</p>
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
                        <div class="tour-overview" data-aos="fade-up" data-aos-delay="200">
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
                                          <h4>Overview</h4>
                                          <hr>
                                          {{ tour?.overview }}
                                          <br> <br>
                                          <h4>Short Description</h4>
                                          <hr>
                                          {{ tour?.short_description }}
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
                                                      <b>${{ date.price }}</b>
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
                        <div class="tour-itinerary" data-aos="fade-up" data-aos-delay="300">
                              <div class="row">
                                    <div class="col-md-8">
                                          <h3>Itinerary</h3>
                                          <hr>
                                          <div class="itinerary-timeline">
                                                <div class="itinerary-item" v-for="item in tour?.tour_itinerary"
                                                      :key="item.id">
                                                      <div class="day-number">Day {{ item.day_number }}</div>
                                                      <div class="day-content">
                                                            <h4>{{ item.title }}</h4>
                                                            <p>{{ item.description }}</p>

                                                            <!-- Optional image if available -->
                                                            <div v-if="item.image_url" class="day-image">
                                                                  <img :src="item.image_url" :alt="item.title"
                                                                        style="width:100%; height:100%">
                                                            </div>

                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                                    <div class="col-lg-4">
                                          <div class="card">
                                                <div class="card-body">
                                                      <h4>Highlights</h4>
                                                      <hr>
                                                      {{ tour?.highlights }}
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
                                          <div class="card">
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
                        <div class="tour-inclusions" data-aos="fade-up" data-aos-delay="400">
                              <div class="row">
                                    <div class="col-md-8">
                                          <div class="row">
                                                <div class="col-lg-6">
                                                      <div class="included-section">
                                                            <h3><i class="bi bi-check-circle-fill"></i> What's Included
                                                            </h3>
                                                            <ul class="inclusion-list included"
                                                                  v-for="item in tour?.tour_inclusion" :key="item.id">
                                                                  <li><i class="bi bi-check"></i> {{ item.item }}</li>
                                                            </ul>
                                                      </div>
                                                </div>
                                                <div class="col-lg-6">
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
                                    <div class="col-md-4" v-if="tour?.tour_download">
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
                        <div class="tour-gallery" data-aos="fade-up" data-aos-delay="700">
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

                  </div>

            </section><!-- /Travel Tour Details Section -->

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
</style>