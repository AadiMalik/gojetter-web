<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import api from '@/api'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { toast } from 'vue3-toastify'
import { useCurrencyStore } from "@/store/currency"

const currency = useCurrencyStore()

// Initialize router
const route = useRoute()
const router = useRouter()

// Stripe initialization
let stripe = null
let elements = null
let cardElement = null

// Form refs
const cardName = ref("")
const loading = ref(false)
const tour = ref(null)
const couponCode = ref("")
const appliedCoupon = ref(null)
const applyingCoupon = ref(false)
const travelers = ref([])
const termsAgreed = ref(false)
const placingBooking = ref(false)

const tour_id = ref(route.query.tour_id || '')
const tour_date = ref(route.query.tour_date || '')
const quantity = ref(Number(route.query.quantity) || 1)
const price = ref(Number(route.query.price) || 0)
const slug = ref(route.query.slug || '')
const auth = useAuthStore()
const cards = ref([])
const selectedCardId = ref(null)
const paymentMethod = ref('new') // 'new' or 'saved'
const subtotal = computed(() => quantity.value * price.value)
// Form data refs
const personalInfo = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
})

const addressInfo = ref({
    country: '',
    zipcode: '',
    address: ''
})

// Computed properties for pricing
const discountAmount = computed(() => {
    if (!appliedCoupon.value) return 0

    let calculatedDiscount = 0
    const sub_total = quantity.value * price.value;
    if (appliedCoupon.value.type === 'percentage') {
        calculatedDiscount = (sub_total * appliedCoupon.value.value) / 100
    } else if (appliedCoupon.value.type === 'amount') {
        calculatedDiscount = Math.min(appliedCoupon.value.value, sub_total)
    }

    // If discount is equal to or greater than subtotal, return 0
    if (calculatedDiscount >= sub_total) {
        return 0
    }

    return calculatedDiscount
})

const totalAmount = computed(() => subtotal.value - discountAmount.value)

// Validation computed property
const isFormValid = computed(() => {
    const personalValid = personalInfo.value.first_name &&
        personalInfo.value.last_name &&
        personalInfo.value.email &&
        personalInfo.value.phone

    const addressValid = addressInfo.value.country &&
        addressInfo.value.zipcode &&
        addressInfo.value.address

    const paymentValid = paymentMethod.value === 'saved' ? selectedCardId.value : true

    const travelersValid = travelers.value.length > 0 &&
        travelers.value.every(t =>
            t.first_name.trim() !== "" &&
            t.last_name.trim() !== ""
        )

    return personalValid &&
        addressValid &&
        paymentValid &&
        termsAgreed.value &&
        travelersValid && // 🔥 required for Laravel to pass
        totalAmount.value > 0
})


onMounted(async () => {
    await CustomerCard()
    await fetchTour()

    // Initialize Stripe after component is mounted
    try {
        stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY)

        if (!stripe) {
            throw new Error('Failed to load Stripe')
        }

        elements = stripe.elements()

        // Create card element
        const style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }

        cardElement = elements.create('card', { style: style })
        cardElement.mount('#card-element')

        // Handle real-time validation errors
        cardElement.on('change', ({ error }) => {
            const displayError = document.getElementById('card-errors')
            if (error) {
                displayError.textContent = error.message
            } else {
                displayError.textContent = ''
            }
        })
    } catch (error) {
        console.error('Error loading Stripe:', error)
        toast.error('Failed to load payment system. Please refresh the page.')
    }
})
async function fetchTour() {
    if (!slug.value) {
        router.push('/tours')
        return
    }

    loading.value = true
    try {
        const res = await api.get(`/tour-by-slug/${slug.value}`)
        if (res.data?.Success && res.data?.Data) {
            tour.value = res.data.Data.detail
            console.log(tour.value)
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

async function handleAddCard() {
    loading.value = true
    const displayError = document.getElementById('card-errors')

    try {
        const { paymentMethod: stripePaymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: cardName.value,
            },
        })

        if (error) {
            displayError.textContent = error.message
            toast.error(error.message)
            loading.value = false
            return
        }

        // ✅ send only payment_method_id to backend
        const res = await api.post("/save-customer-card", {
            payment_method_id: stripePaymentMethod.id,
        })

        toast.success("Card saved successfully")
        await CustomerCard()

        // Clear form
        cardName.value = ""
        cardElement.clear()

        console.log("Server response:", res.data)
    } catch (e) {
        console.error(e)
        toast.error("Something went wrong")
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
            if (cards.value.length > 0 && !selectedCardId.value) {
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

// Get card icon based on brand
function getCardIcon(brand) {
    const icons = {
        visa: 'bi-credit-card',
        mastercard: 'bi-credit-card-2-back',
        amex: 'bi-credit-card-2-front',
        discover: 'bi-credit-card',
        diners: 'bi-credit-card',
        jcb: 'bi-credit-card',
        unionpay: 'bi-credit-card'
    }
    return icons[brand] || 'bi-credit-card'
}

// Apply coupon function
async function applyCoupon() {
    if (!couponCode.value.trim()) {
        toast.error('Please enter a coupon code')
        return
    }

    applyingCoupon.value = true
    try {
        const res = await api.post('/apply-coupon', {
            code: couponCode.value.trim()
        })

        if (res.data?.Success) {
            appliedCoupon.value = res.data.Data
            toast.success(`Coupon applied successfully: ${appliedCoupon.value.code}`)
            couponCode.value = ""
        } else {
            toast.error(res.data?.Message || 'Invalid coupon code')
        }
    } catch (error) {
        console.error('Coupon apply error:', error)
        if (error.response?.data?.Message) {
            toast.error(error.response.data.Message)
        } else {
            toast.error('Failed to apply coupon')
        }
    } finally {
        applyingCoupon.value = false
    }
}

// Remove coupon function
function removeCoupon() {
    appliedCoupon.value = null
    toast.info('Coupon removed')
}

// travelers add
watch(quantity, (newQty) => {
    travelers.value = Array.from({ length: newQty }, (_, i) => ({
        first_name: "",
        last_name: "",
        dob: "",
        weight: "",
        weight_unit: "KG",
        type: "adult"
    }))
}, { immediate: true })

// Complete order function
async function completeBooking() {
    if (!isFormValid.value) {
        toast.error('Please complete all required fields and agree to terms & conditions')
        return
    }

    if (totalAmount.value <= 0) {
        toast.error('Invalid booking total')
        return
    }

    placingBooking.value = true

    try {
        // Prepare order data according to API requirements
        const bookingData = {
            tour_id: tour_id.value,
            tour_date: tour_date.value,
            card_id: selectedCardId.value,
            currency_id: currency.selected.id,
            first_name: personalInfo.value.first_name,
            last_name: personalInfo.value.last_name,
            email: personalInfo.value.email,
            phone: personalInfo.value.phone,
            country: addressInfo.value.country,
            zipcode: addressInfo.value.zipcode,
            address: addressInfo.value.address,
            quantity: quantity.value,
            sub_total: subtotal.value * currency.selected.rate,
            tax_percent: 0,
            tax_amount: 0,
            discount: discountAmount.value * currency.selected.rate,
            total: totalAmount.value * currency.selected.rate,
            payment_method: 'stripe',
            coupon_id: appliedCoupon.value?.id || null,
            booking_details: travelers.value
        }

        // Send booking to backend
        const response = await api.post('/save-booking', bookingData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        })

        if (response.data.Success) {
            toast.success('Booking created successfully!')

            // Clear cart and redirect
            // cartStore.clearCart()
            router.push('/account/booking')
        } else {
            toast.error(response.data.Message || 'Failed to place booking')
        }
    } catch (error) {
        console.error('Booking placement error:', error)
        if (error.response?.data?.errors) {
            // Handle validation errors from Laravel
            const errors = error.response.data.errors
            const firstError = Object.values(errors)[0][0]
            toast.error(firstError)
        } else if (error.response?.data?.Message) {
            toast.error(error.response.data.Message)
        } else {
            toast.error('Failed to place booking. Please try again.')
        }
    } finally {
        placingBooking.value = false
    }
}
</script>


<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade"
            style="background-image: url(/assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>Booking</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia
                    assumenda numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Booking</li>
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
                            <div class="booking-progress nav nav-tabs" data-aos="fade-up" data-aos-delay="200">
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
                            <div class="booking-form" data-aos="fade-up" data-aos-delay="300">

                                <div class="tab-content" id="bookingTabContent">
                                    <!-- Step 1: Tour & Dates -->
                                    <div class="form-step tab-pane fade show active" id="travel-booking-step-1"
                                        role="tabpanel">
                                        <h4>Personal Information</h4>

                                        <div class="row gy-4">
                                            <div class="col-md-6">
                                                <label for="first_name">First Name <span
                                                        class="text-danger">*</span></label>
                                                <input type="text" name="first_name" v-model="personalInfo.first_name"
                                                    class="form-control" id="first_name"
                                                    placeholder="Enter first name.." value="">
                                            </div>
                                            <div class="col-md-6">
                                                <label for="last_name">Last Name <span
                                                        class="text-danger">*</span></label>
                                                <input type="text" name="last_name" v-model="personalInfo.last_name"
                                                    class="form-control" id="last_name" placeholder="Enter last name.."
                                                    value="">
                                            </div>
                                            <div class="col-md-6">
                                                <label for="email">Email <span class="text-danger">*</span></label>
                                                <input type="email" name="email" v-model="personalInfo.email"
                                                    class="form-control" id="email" placeholder="Enter email.."
                                                    value="">
                                            </div>
                                            <div class="col-md-6">
                                                <label for="phone">Phone <span class="text-danger">*</span></label>
                                                <input type="text" name="phone" v-model="personalInfo.phone"
                                                    class="form-control" id="phone" placeholder="Enter phone.."
                                                    value="">
                                            </div>
                                        </div>
                                    </div><!-- End Step 1 -->

                                    <!-- Step 2: Traveler Information -->
                                    <div class="form-step tab-pane fade" id="travel-booking-step-2" role="tabpanel">
                                        <h4>Address Information</h4>

                                        <div class="traveler-info">
                                            <div class="row gy-3">
                                                <div class="col-md-6">
                                                    <label for="country">Country <span
                                                            class="text-danger">*</span></label>
                                                    <input type="text" name="country" class="form-control" id="country"
                                                        v-model="addressInfo.country" placeholder="Enter country.."
                                                        value="">
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="zipcode">Zipcode <span
                                                            class="text-danger">*</span></label>
                                                    <input type="text" name="zipcode" class="form-control" id="zipcode"
                                                        v-model="addressInfo.zipcode" placeholder="Enter zipcode.."
                                                        value="">
                                                </div>
                                                <div class="col-md-12">
                                                    <label for="address">Address <span
                                                            class="text-danger">*</span></label>
                                                    <input type="text" name="address" v-model="addressInfo.address"
                                                        class="form-control" id="address" placeholder="Enter address.."
                                                        value="">
                                                </div>
                                            </div>
                                        </div>
                                    </div><!-- End Step 2 -->

                                    <!-- Step 3: Payment Information -->
                                    <div class="form-step tab-pane fade" id="travel-booking-step-4" role="tabpanel">
                                        <h4>Payment Information</h4>

                                        <div class="payment-methods mb-4">
                                            <div class="method-selector">
                                                <input type="radio" name="payment_type" v-model="paymentMethod"
                                                    id="new-card" value="new" checked>
                                                <label for="new-card"><i class="bi bi-plus-circle"></i> Add
                                                    New Card</label>
                                            </div>
                                            <div class="method-selector" v-if="cards.length > 0">
                                                <input type="radio" name="payment_type" v-model="paymentMethod"
                                                    id="saved-card" value="saved">
                                                <label for="saved-card"><i class="bi bi-wallet2"></i> Use Saved
                                                    Card</label>
                                            </div>
                                        </div>

                                        <!-- New Card Form -->
                                        <div class="new-card-form mb-4" v-if="paymentMethod === 'new'">
                                            <div class="row gy-3">
                                                <div class="col-12">
                                                    <label for="card-name">Cardholder
                                                        Name</label>
                                                    <input v-model="cardName" type="text" id="card-name"
                                                        class="form-control" required />
                                                </div>
                                                <div class="col-12">
                                                    <label for="card-element">Card
                                                        Details</label>
                                                    <div id="card-element" class="form-control p-2"></div>
                                                    <div id="card-errors" class="text-danger mt-2 small">
                                                    </div>
                                                </div>
                                                <div class="col-md-12">
                                                    <button type="button" class="btn btn-primary" :disabled="loading"
                                                        @click="handleAddCard">
                                                        {{
                                                            loading ? "Saving..." : "Add Card"
                                                        }}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Saved Cards -->
                                        <div class="saved-cards" v-if="paymentMethod === 'saved' && cards.length > 0">
                                            <h5 class="mb-3">Your Saved Cards</h5>
                                            <div class="row">
                                                <div v-for="card in cards" :key="card.id" class="col-md-6 mb-3">
                                                    <div class="card h-100"
                                                        :class="{ 'border-primary shadow': selectedCardId === card.id }"
                                                        @click="selectCard(card.id)" style="cursor: pointer;">
                                                        <div class="card-body d-flex align-items-center">
                                                            <div class="me-3">
                                                                <i class="bi" :class="getCardIcon(card.card_brand)"
                                                                    style="font-size: 2rem;"></i>
                                                            </div>
                                                            <div>
                                                                <h6 class="card-title mb-1 text-capitalize">
                                                                    {{ card.card_brand
                                                                    }}</h6>
                                                                <p class="card-text mb-1 small">
                                                                    **** **** **** {{
                                                                        card.card_last_four
                                                                    }}</p>
                                                                <p class="card-text small mb-0">
                                                                    Exp: {{
                                                                        card.exp_month
                                                                    }}/{{
                                                                        card.exp_year }}
                                                                </p>
                                                            </div>
                                                            <div class="ms-auto">
                                                                <i class="bi bi-check-circle-fill text-primary"
                                                                    v-if="selectedCardId === card.id"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="secure-payment mt-4">
                                            <i class="bi bi-shield-check"></i>
                                            <span>Your payment information is secure and
                                                encrypted</span>
                                        </div>
                                    </div><!-- End Step 3 -->

                                    <!-- Step 4: Review -->
                                    <div class="form-step tab-pane fade" id="travel-booking-step-3" role="tabpanel">
                                        <h4>Add Travelers</h4>

                                        <div class="addon-options">
                                            <!-- Personal Information Review -->
                                            <div v-for="(traveler, index) in travelers" :key="index"
                                                class="addon-item mb-4">
                                                <h5 class="mb-3">Traveler {{ index + 1 }}</h5>
                                                <hr>
                                                <div class="row">
                                                    <div class="col-md-6 mb-2">
                                                        <label>First Name<span class="text-danger">*</span></label>
                                                        <input type="text" v-model="traveler.first_name"
                                                            class="form-control" required>
                                                    </div>
                                                    <div class="col-md-6 mb-2">
                                                        <label>Last Name<span class="text-danger">*</span></label>
                                                        <input type="text" v-model="traveler.last_name"
                                                            class="form-control" required>
                                                    </div>
                                                    <div class="col-md-6 mb-2">
                                                        <label>Date of Birth</label>
                                                        <input type="date" v-model="traveler.dob" class="form-control">
                                                    </div>
                                                    <div class="col-md-6 mb-2">
                                                        <label>Weight (KG)</label>
                                                        <input type="number" v-model="traveler.weight"
                                                            class="form-control">
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Terms and Conditions -->
                                            <div class="terms-agreement mb-4">
                                                <div class="form-check">
                                                    <input type="checkbox" v-model="termsAgreed" id="terms-agreement"
                                                        class="form-check-input" required>
                                                    <label for="terms-agreement" class="form-check-label">
                                                        I agree to the <router-link to="/terms">Terms &
                                                            Conditions</router-link> and
                                                        <router-link to="/privacy">Privacy
                                                            Policy</router-link>
                                                    </label>
                                                </div>
                                            </div>

                                            <!-- Complete Order Button -->
                                            <div class="form-navigation">
                                                <button type="button" @click="completeBooking" class="btn btn-book"
                                                    :disabled="!isFormValid || placingBooking">
                                                    {{ placingBooking ? 'Processing...' :
                                                        'Complete Booking' }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- End Step 4 -->

                                </div><!-- End Tab Content -->

                            </div><!-- End Booking Form -->
                        </div>
                    </div>

                    <!-- Booking Summary Sidebar -->
                    <div class="col-lg-4">
                        <div class="booking-summary" data-aos="fade-up" data-aos-delay="400">
                            <div class="summary-header">
                                <h4>Booking Summary</h4>
                            </div>
                            <div class="selected-tour">
                                <img :src="(tour?.thumbnail_url) ? tour?.thumbnail_url : '/assets/img/travel/tour-15.webp'"
                                    alt="Selected Tour" class="img-fluid">
                                <div class="tour-info">
                                    <h5>{{ tour?.title }}</h5>
                                    <p><i class="bi bi-calendar"></i> {{ tour?.duration }}</p>
                                    <p><i class="bi bi-geo-alt"></i> {{ tour?.destination.name }}</p>
                                </div>
                            </div>

                            <div class="booking-details">
                                <div class="detail-item">
                                    <span class="label">Date:</span>
                                    <span class="value">{{ tour_date }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Travelers:</span>
                                    <span class="value">{{ quantity }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Price:</span>
                                    <span class="value">{{ currency.format(price) }}</span>
                                </div>
                            </div>


                            <div class="price-breakdown">
                                <div class="price-item">
                                    <span class="description">Subtotal</span>
                                    <span class="amount">{{ currency.format(subtotal) }}</span>
                                </div>

                                <!-- Discount row -->
                                <div class="price-item" v-if="appliedCoupon">
                                    <span class="description">
                                        Discount
                                        <span v-if="appliedCoupon.type === 'percentage'">
                                            ({{ appliedCoupon.value }}%)
                                        </span>
                                        <span v-if="appliedCoupon.type === 'amount'">
                                            ({{ currency.format(appliedCoupon.value) }} off)
                                        </span>
                                    </span>
                                    <span class="amount text-danger">- {{ currency.format(discountAmount)
                                    }}</span>
                                </div>

                                <div class="price-total">
                                    <span class="description">Total Amount</span>
                                    <span class="amount">{{ currency.format(totalAmount) }}</span>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <hr>
                                    <!-- Applied coupon badge -->
                                    <span class="badge bg-success rounded-pill mb-2" v-if="appliedCoupon"
                                        style="padding:8px; display: inline-flex; align-items: center;">
                                        <span style="margin-right:10px;">{{ appliedCoupon.code
                                        }}</span>
                                        <a href="#" class="text-white" title="Remove Coupon"
                                            @click.prevent="removeCoupon">
                                            <i class="bi bi-trash"></i>
                                        </a>
                                    </span>

                                    <!-- Coupon input form -->
                                    <div class="input-group mb-2" v-if="!appliedCoupon">
                                        <input type="text" class="form-control" placeholder="Enter code.."
                                            v-model="couponCode" @keyup.enter="applyCoupon" :disabled="applyingCoupon">
                                        <button class="btn btn-primary" @click="applyCoupon" :disabled="applyingCoupon">
                                            {{ applyingCoupon ? 'Applying...' : 'Apply' }}
                                        </button>
                                    </div>
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

<style scoped>
.card {
    transition: all 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
}

.method-selector {
    display: inline-block;
    margin-right: 15px;
}

.method-selector input[type="radio"] {
    display: none;
}

.method-selector label {
    padding: 10px 15px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.method-selector input[type="radio"]:checked+label {
    background-color: #0d6efd;
    color: white;
    border-color: #0d6efd;
}

#card-element {
    min-height: 40px;
    padding: 10px;
}

.price-item .text-danger {
    font-weight: bold;
}

.badge bg-success {
    display: inline-flex;
    align-items: center;
}

.badge bg-success a {
    margin-left: 8px;
    opacity: 0.8;
}

.badge bg-success a:hover {
    opacity: 1;
}

.input-group {
    margin-top: 10px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>