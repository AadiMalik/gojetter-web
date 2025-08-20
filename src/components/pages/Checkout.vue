<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { toast } from 'vue3-toastify'

// stripe card register
let stripe = Stripe(import.meta.env.VITE_STRIPE_KEY)
// Form refs
const cardName = ref("")
const cardNumber = ref("")
const cardCvv = ref("")
const cardExpMonth = ref("")
const cardExpYear = ref("")
const cardBrand = ref("credit_card")

const loading = ref(false)

import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const { carts } = storeToRefs(cartStore)
const auth = useAuthStore()
const cards = ref([])
const selectedCardId = ref(null)

onMounted(async () => {
      cartStore.fetchCart()
      CustomerCard()
})
async function handleAddCard() {
      loading.value = true
      try {
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                  type: "card",
                  card: {
                        number: cardNumber.value,
                        exp_month: cardExpMonth.value,
                        exp_year: cardExpYear.value,
                        cvc: cardCvv.value,
                  },
                  billing_details: {
                        name: cardName.value,
                  },
                  metadata: {
                  card_brand_type: cardBrand.value // credit_card / debit_card / charge_card
            }
            })

      if (error) {
            alert(error.message)
            loading.value = false
            return
      }

      // ✅ send only payment_method_id to backend
      const res = await api.post("/save-customer-card", {
            payment_method_id: paymentMethod.id,
      })

      alert("Card saved successfully")
      CustomerCard()
      console.log("Server response:", res.data)
} catch (e) {
      console.error(e)
      alert("Something went wrong")
} finally {
      loading.value = false
}
}
async function CustomerCard() {
      try {
            const res = await api.get('/customer-card-list', {
                  headers: {
                        Authorization: `Bearer ${auth.token}`
                  }
            })
            if (res.data?.Success) {
                  cards.value = res.data.Data || []
                  if (cards.value.length > 0) {
                        selectedCardId.value = cards.value[0].id // ✅ Select first by default
                  }
            }
      } catch (err) {
            console.error("Card fetch error:", err)
      }
}
function selectCard(id) {
      selectedCardId.value = id
}
</script>
<template>
      <main class="main">

            <!-- Page Title -->
            <div class="page-title dark-background" data-aos="fade"
                  style="background-image: url(/assets/img/travel/showcase-8.webp);">
                  <div class="container position-relative">
                        <h1>Checkout</h1>
                        <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia
                              assumenda numquam molestias.</p>
                        <nav class="breadcrumbs">
                              <ol>
                                    <li><router-link to="/">Home</router-link></li>
                                    <li class="current">Checkout</li>
                              </ol>
                        </nav>
                  </div>
            </div><!-- End Page Title -->

            <!-- Travel Booking Section -->
            <section id="travel-booking" class="travel-booking section">

                  <div class="container" data-aos="fade-up" data-aos-delay="100">

                        <div class="row">
                              <div class="col-lg-8">
                                    <div class="booking-form-container">
                                          <!-- Progress Steps -->
                                          <div class="booking-progress nav nav-tabs" data-aos="fade-up"
                                                data-aos-delay="200">
                                                <button class="step nav-link active" data-bs-toggle="tab"
                                                      data-bs-target="#travel-booking-step-1" aria-current="page">
                                                      <span class="step-number">1</span>
                                                      <span class="step-title">Personal</span>
                                                </button>
                                                <button class="step nav-link" data-bs-toggle="tab"
                                                      data-bs-target="#travel-booking-step-2">
                                                      <span class="step-number">2</span>
                                                      <span class="step-title">Address</span>
                                                </button>
                                                <button class="step nav-link" data-bs-toggle="tab"
                                                      data-bs-target="#travel-booking-step-4">
                                                      <span class="step-number">3</span>
                                                      <span class="step-title">Payment</span>
                                                </button>
                                                <button class="step nav-link" data-bs-toggle="tab"
                                                      data-bs-target="#travel-booking-step-3">
                                                      <span class="step-number">4</span>
                                                      <span class="step-title">Complete</span>
                                                </button>
                                          </div><!-- End Progress Steps -->

                                          <!-- Booking Form -->
                                          <form action="" method="post" class="booking-form" data-aos="fade-up"
                                                data-aos-delay="300">

                                                <div class="tab-content" id="bookingTabContent">
                                                      <!-- Step 1: Tour & Dates -->
                                                      <div class="form-step tab-pane fade show active"
                                                            id="travel-booking-step-1" role="tabpanel">
                                                            <h4>Personal Information</h4>

                                                            <div class="row gy-4">
                                                                  <div class="col-md-6">
                                                                        <label for="first_name">First Name <span
                                                                                    class="text-danger">*</span></label>
                                                                        <input type="text" name="first_name"
                                                                              class="form-control" id="first_name"
                                                                              placeholder="Enter first name.." value="">
                                                                  </div>
                                                                  <div class="col-md-6">
                                                                        <label for="last_name">Last Name <span
                                                                                    class="text-danger">*</span></label>
                                                                        <input type="text" name="last_name"
                                                                              class="form-control" id="last_name"
                                                                              placeholder="Enter last name.." value="">
                                                                  </div>
                                                                  <div class="col-md-6">
                                                                        <label for="email">Email <span
                                                                                    class="text-danger">*</span></label>
                                                                        <input type="email" name="email"
                                                                              class="form-control" id="email"
                                                                              placeholder="Enter email.." value="">
                                                                  </div>
                                                                  <div class="col-md-6">
                                                                        <label for="phone">Phone <span
                                                                                    class="text-danger">*</span></label>
                                                                        <input type="text" name="phone"
                                                                              class="form-control" id="phone"
                                                                              placeholder="Enter phone.." value="">
                                                                  </div>
                                                            </div>
                                                      </div><!-- End Step 1 -->

                                                      <!-- Step 2: Traveler Information -->
                                                      <div class="form-step tab-pane fade" id="travel-booking-step-2"
                                                            role="tabpanel">
                                                            <h4>Address Information</h4>

                                                            <div class="traveler-info">
                                                                  <div class="row gy-3">
                                                                        <div class="col-md-6">
                                                                              <label for="country">Country <span
                                                                                          class="text-danger">*</span></label>
                                                                              <input type="text" name="country"
                                                                                    class="form-control" id="country"
                                                                                    placeholder="Enter country.."
                                                                                    value="">
                                                                        </div>
                                                                        <div class="col-md-6">
                                                                              <label for="zipcode">Zipcode <span
                                                                                          class="text-danger">*</span></label>
                                                                              <input type="text" name="zipcode"
                                                                                    class="form-control" id="zipcode"
                                                                                    placeholder="Enter zipcode.."
                                                                                    value="">
                                                                        </div>
                                                                        <div class="col-md-12">
                                                                              <label for="address">Address <span
                                                                                          class="text-danger">*</span></label>
                                                                              <input type="text" name="address"
                                                                                    class="form-control" id="address"
                                                                                    placeholder="Enter address.."
                                                                                    value="">
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div><!-- End Step 2 -->

                                                      <!-- Step 3: Payment Information -->
                                                      <div class="form-step tab-pane fade" id="travel-booking-step-4"
                                                            role="tabpanel">
                                                            <h4>Payment Information</h4>

                                                            <div class="payment-methods">
                                                                  <div class="method-selector">
                                                                        <input type="radio" name="card_brand"  v-model="cardBrand" id="visa"
                                                                              value="visa" checked="">
                                                                        <label for="visa"><i
                                                                                    class="bi bi-credit-card"></i>
                                                                              Visa</label>
                                                                  </div>
                                                                  <div class="method-selector">
                                                                        <input type="radio" name="card_brand"  v-model="cardBrand"
                                                                              id="master-card" value="mastercard"
                                                                              checked="">
                                                                        <label for="master-card"><i
                                                                                    class="bi bi-credit-card"></i>
                                                                              Master Card</label>
                                                                  </div>
                                                                  <div class="method-selector">
                                                                        <input type="radio" name="card_brand"  v-model="cardBrand" id="amex"
                                                                              value="amex" checked="">
                                                                        <label for="amex"><i
                                                                                    class="bi bi-credit-card"></i>
                                                                              AMEX</label>
                                                                  </div>
                                                            </div>

                                                            <div class="payment-details">
                                                                  <div class="row gy-3">
                                                                        <div class="col-12">
                                                                              <label for="card-name">Cardholder
                                                                                    Name</label>
                                                                              <input v-model="cardName" type="text"
                                                                                    id="card-name" class="form-control"
                                                                                    required />
                                                                        </div>
                                                                        <div class="col-md-8">
                                                                              <label for="card-number">Card
                                                                                    Number</label>
                                                                              <input v-model="cardNumber" type="text"
                                                                                    id="card-number"
                                                                                    class="form-control"
                                                                                    placeholder="1234 5678 9012 3456"
                                                                                    required />
                                                                        </div>
                                                                        <div class="col-md-4">
                                                                              <label for="card-cvv">CVV</label>
                                                                              <input v-model="cardCvv" type="text"
                                                                                    id="card-cvv" class="form-control"
                                                                                    placeholder="123" required />
                                                                        </div>
                                                                        <div class="col-md-6">
                                                                              <label for="card-expiry-month">Expiry
                                                                                    Month</label>
                                                                              <select v-model="cardExpMonth"
                                                                                    id="card-expiry-month"
                                                                                    class="form-select" required>
                                                                                    <option value="">Month</option>
                                                                                    <option v-for="m in 12" :key="m"
                                                                                          :value="String(m).padStart(2, '0')">
                                                                                          {{ String(m).padStart(2, "0")
                                                                                          }}
                                                                                    </option>
                                                                              </select>
                                                                        </div>
                                                                        <div class="col-md-6">
                                                                              <label for="card-expiry-year">Expiry
                                                                                    Year</label>
                                                                              <select v-model="cardExpYear"
                                                                                    id="card-expiry-year"
                                                                                    class="form-select" required>
                                                                                    <option value="">Year</option>
                                                                                    <option v-for="y in 15" :key="y"
                                                                                          :value="2025 + (y - 1)">
                                                                                          {{ 2025 + (y - 1) }}
                                                                                    </option>
                                                                              </select>
                                                                        </div>
                                                                        <div class="col-md-12">
                                                                              <button type="button"
                                                                                    class="btn btn-primary"
                                                                                    :disabled="loading"
                                                                                    @click="handleAddCard">
                                                                                    {{ loading ? "Saving..." : "Add" }}
                                                                              </button>
                                                                        </div>
                                                                  </div>

                                                                  <div class="secure-payment">
                                                                        <i class="bi bi-shield-check"></i>
                                                                        <span>Your payment information is secure and
                                                                              encrypted</span>
                                                                  </div>
                                                                  <div class="row mt-2">
                                                                        <div v-for="card in cards" :key="card.id"
                                                                              class="col-md-6">
                                                                              <!-- Hidden radio button -->
                                                                              <input type="radio" :value="card.id"
                                                                                    v-model="selectedCardId"
                                                                                    class="d-none" />

                                                                              <!-- Clickable card -->
                                                                              <div class="card mb-2"
                                                                                    :class="{ 'border-primary shadow': selectedCardId === card.id }"
                                                                                    @click="selectCard(card.id)"
                                                                                    style="cursor: pointer;border: 2px solid;">
                                                                                    <div class="card-body">
                                                                                          <i
                                                                                                class="bi bi-credit-card"></i>
                                                                                          <b> {{ card.card_brand }}</b>
                                                                                          <br>
                                                                                          <small><b>{{ card.card_holder_name
                                                                                          }}</b></small>
                                                                                          <br>
                                                                                          <small>************{{
                                                                                                card.card_last_four
                                                                                                }}</small>
                                                                                          <br>
                                                                                          <small>{{ card.exp_month }}/{{
                                                                                                card.exp_year }}</small>
                                                                                    </div>
                                                                              </div>
                                                                        </div>
                                                                  </div>

                                                            </div>
                                                      </div><!-- End Step 3 -->

                                                      <!-- Step 4: Add-ons & Extras -->
                                                      <div class="form-step tab-pane fade" id="travel-booking-step-3"
                                                            role="tabpanel">
                                                            <h4>Review</h4>

                                                            <div class="addon-options">
                                                                  <div class="addon-item">
                                                                        <h5 style="margin:0px;">Personal Information
                                                                        </h5>
                                                                        <hr>
                                                                        <div class="row">
                                                                              <div class="col-md-6">
                                                                                    <span>First Name: <b>Customer First
                                                                                                Name</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Last Name: <b>Customer Last
                                                                                                Name</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Email:
                                                                                          <b>customer@customer.com</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Phone: <b>123456789</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Zipcode: <b>123456</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Country:
                                                                                          <b>Pakistan</b></span>
                                                                              </div>
                                                                              <div class="col-md-12">
                                                                                    <span>Address: <b>Our travel experts
                                                                                                are here to assist you
                                                                                                Our travel experts are
                                                                                                here to assist
                                                                                                you</b></span>
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                                  <div class="addon-item">
                                                                        <h5 style="margin:0px;">Address Information</h5>
                                                                        <hr>
                                                                        <div class="row">
                                                                              <div class="col-md-6">
                                                                                    <span>Zipcode: <b>123456</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Country:
                                                                                          <b>Pakistan</b></span>
                                                                              </div>
                                                                              <div class="col-md-12">
                                                                                    <span>Address: <b>Our travel experts
                                                                                                are here to assist you
                                                                                                Our travel experts are
                                                                                                here to assist
                                                                                                you</b></span>
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                                  <div class="addon-item">
                                                                        <h5 style="margin:0px;">Payment Information</h5>
                                                                        <hr>
                                                                        <div class="row">
                                                                              <div class="col-md-6">
                                                                                    <span>Zipcode: <b>123456</b></span>
                                                                              </div>
                                                                              <div class="col-md-6">
                                                                                    <span>Country:
                                                                                          <b>Pakistan</b></span>
                                                                              </div>
                                                                              <div class="col-md-12">
                                                                                    <span>Address: <b>Our travel experts
                                                                                                are here to assist you
                                                                                                Our travel experts are
                                                                                                here to assist
                                                                                                you</b></span>
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                                  <div class="terms-agreement">
                                                                        <div class="form-check">
                                                                              <input type="checkbox"
                                                                                    name="terms_agreement"
                                                                                    id="terms-agreement"
                                                                                    class="form-check-input"
                                                                                    required="">
                                                                              <label for="terms-agreement"
                                                                                    class="form-check-label">
                                                                                    I agree to the <a href="#">Terms
                                                                                          &amp;
                                                                                          Conditions</a> and <a
                                                                                          href="#">Privacy Policy</a>
                                                                              </label>
                                                                        </div>
                                                                  </div>

                                                                  <div class="form-navigation">
                                                                        <button type="submit"
                                                                              class="btn btn-book">Complete
                                                                              Order</button>
                                                                  </div>
                                                            </div>
                                                      </div><!-- End Step 4 -->

                                                </div><!-- End Tab Content -->

                                          </form><!-- End Booking Form -->
                                    </div>
                              </div>

                              <!-- Booking Summary Sidebar -->
                              <div class="col-lg-4">
                                    <div class="booking-summary" data-aos="fade-up" data-aos-delay="400">
                                          <div class="summary-header">
                                                <h4>Cart Summary</h4>
                                          </div>
                                          <table class="table">
                                                <thead>
                                                      <tr>
                                                            <th>Activity</th>
                                                            <th>Quantity</th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      <tr v-for="cart in carts">
                                                            <td>
                                                                  {{ cart.activity.title }} <br>
                                                                  <small>Price: ${{ (cart?.activity_date?.discount_price
                                                                        &&
                                                                        cart?.activity_date?.discount_price > 0)
                                                                        ? cart?.activity_date?.discount_price
                                                                        : cart?.activity_date?.price }}</small>
                                                            </td>
                                                            <td style="text-align: right;">
                                                                  {{ cart?.quantity }}
                                                            </td>
                                                      </tr>
                                                </tbody>
                                          </table>

                                          <div class="price-breakdown">
                                                <div class="price-item">
                                                      <span class="description">Subtotal</span>
                                                      <span class="amount">${{ cartStore.cartTotal }}</span>
                                                </div>
                                                <div class="price-item">
                                                      <span class="description">
                                                            Discount
                                                      </span>
                                                      <span class="amount">$0</span>
                                                </div>
                                                <!-- <div class="price-item">
                                                      <span class="description">Airport Transfer</span>
                                                      <span class="amount">$90</span>
                                                </div>
                                                <div class="price-item tax-item">
                                                      <span class="description">Taxes &amp; Fees</span>
                                                      <span class="amount">$156</span>
                                                </div> -->
                                                <div class="price-total">
                                                      <span class="description">Total Amount</span>
                                                      <span class="amount">$2,323</span>
                                                </div>
                                          </div>
                                          <div class="row">
                                                <div class="col-md-12">
                                                      <hr>
                                                      <span class="badge bg-secondary rounded-pill mb-1"
                                                            style="padding:5px;">
                                                            <span style="margin-right:10px;">Code123</span> <a href="#"
                                                                  class="text-white" title="Remove Coupon"><i
                                                                        class="bi bi-trash"></i></a>
                                                      </span>
                                                </div>
                                                <div class="col-md-8">
                                                      <input type="text" class="form-control"
                                                            placeholder="Enter code..">
                                                </div>
                                                <div class="col-md-2">
                                                      <button class="btn btn-primary">Apply</button>
                                                </div>
                                          </div>
                                          <div class="help-section">
                                                <h5>Need Help?</h5>
                                                <p>Our travel experts are here to assist you</p>
                                                <div class="contact-info">
                                                      <p><i class="bi bi-telephone"></i> +1 (555) 123-4567</p>
                                                      <p><i class="bi bi-envelope"></i> support@example.com</p>
                                                </div>
                                                <div class="support-hours">
                                                      <small>Available 24/7</small>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                  </div>

            </section><!-- /Travel Booking Section -->

      </main>

</template>