<template>
    <header id="header" class="header d-flex align-items-center fixed-top">
        <div
            class="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">

            <router-link to="/" class="logo d-flex align-items-center me-auto me-xl-0">
                <!-- Uncomment the line below if you also wish to use an image logo -->
                <!-- <img src="/assets/img/logo.webp" alt=""> -->
                <h1 class="sitename">GOJETTER</h1>
            </router-link>

            <nav id="navmenu" class="navmenu">
                <ul>
                    <li><router-link to="/" class="nav-link" active-class="active"
                            style="cursor: pointer;">Home</router-link></li>
                    <li><router-link to="/tours" active-class="active">Tours</router-link></li>
                    <li><router-link to="/activity" active-class="active">Activities</router-link></li>
                    <li class="dropdown"><a href="#"><span>Services</span> <i
                                class="bi bi-chevron-down toggle-dropdown"></i></a>
                        <ul>
                            <li v-for="service in services">
                                <router-link :to="`/service/${service.slug}`">{{ service?.name }}</router-link>
                            </li>
                        </ul>
                    </li>
                    <li><router-link to="/blogs" active-class="active">Blogs</router-link></li>
                    <li><router-link to="/about" style="cursor: pointer;" active-class="active">About</router-link></li>
                    <li><router-link to="/contact" active-class="active">Contact</router-link></li>

                    <li class="dropdown"><a href="#"><span>Pages</span> <i
                                class="bi bi-chevron-down toggle-dropdown"></i></a>
                        <ul>
                            <li><router-link to="/destinations">Destinations</router-link></li>
                            <li><router-link to="/gallary">Gallery</router-link></li>
                            <li><router-link to="/testimonials">Testimonials</router-link></li>
                            <li><router-link to="/faqs">Frequently Asked Questions</router-link></li>
                            <li><router-link to="/terms">Terms</router-link></li>
                            <li><router-link to="/privacy">Privacy</router-link></li>
                        </ul>
                    </li>
                    <!-- Dynamic Auth Links -->
                    <li v-if="!user">
                        <router-link to="/login" active-class="active">
                            <i class="bi bi-unlock" style="font-size: 18px;"></i> Login
                        </router-link>
                    </li>
                    <li v-else class="dropdown">
                        <a href="#" style="cursor: pointer;">
                            <span class="bi bi-person" style="font-size: 18px;"></span> {{ user.name }} <i
                                class="bi bi-chevron-down toggle-dropdown"></i>
                        </a>
                        <ul>
                            <li><router-link to="/account/booking"> My Account</router-link></li>
                            <li>
                                <a @click.prevent="logout" style="cursor: pointer;">
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li v-if="user">
                        <router-link to="/cart" style="padding: 5px 5px;">
                            <i class="bi bi-cart" style="font-size: 18px;"></i> Cart
                            <span v-if="cartCount > 0"
                                class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                                {{ cartCount }}
                            </span>
                        </router-link>
                    </li>
                    <li class="dropdown">
                        <a href="#"><span>{{ currency?.selected?.code }}</span> <i class="bi bi-chevron-down"></i></a>
                        <ul>
                            <li v-for="cur in currency?.currencies" :key="cur?.id">
                                <a @click.prevent="currency?.changeCurrency(cur)" style="cursor: pointer;">
                                    {{ cur?.symbol }} - {{ cur?.code }}
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
            </nav>

            <!-- <router-link class="btn-getstarted" to="/destinations">Get Started</router-link> -->

        </div>
    </header>
</template>
<script setup>
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"
import { useCurrencyStore } from "@/store/currency"
import { useServiceStore } from "@/store/service"

const auth = useAuthStore()
const cartStore = useCartStore()
const currency = useCurrencyStore()
const serviceStore = useServiceStore()
const services = computed(() => serviceStore.services)

const user = computed(() => auth.user)
const cartCount = computed(() => cartStore.carts.length)

function logout() {
    auth.logout()
    cartCount.value = 0
}

onMounted(() => {
    serviceStore.fetchServices()
    currency?.fetchCurrencies()
    if (user.value) cartStore.fetchCart()
})
</script>
