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
                    <li><router-link to="/destinations" active-class="active">Destinations</router-link></li>
                    <li><router-link to="/blogs" active-class="active">Blogs</router-link></li>
                    <li><router-link to="/about" style="cursor: pointer;" active-class="active">About</router-link></li>
                    <li><router-link to="/contact" active-class="active">Contact</router-link></li>
                    <li class="dropdown"><a href="#"><span>Pages</span> <i
                                class="bi bi-chevron-down toggle-dropdown"></i></a>
                        <ul>
                            <li><router-link to="/gallary">Gallery</router-link></li>
                            <li><router-link to="/testimonials">Testimonials</router-link></li>
                            <li><router-link to="/faqs">Frequently Asked Questions</router-link></li>
                            <li><router-link to="/terms">Terms</router-link></li>
                            <li><router-link to="/privacy">Privacy</router-link></li>
                        </ul>
                    </li>
                    <!-- Dynamic Auth Links -->
                    <li v-if="!user"><router-link to="/login" active-class="active">Login</router-link></li>
                    <li v-else class="dropdown">
                        <a href="#" style="cursor: pointer;">
                            <span class="bi bi-person" style="font-size: 18px;"></span> {{ user.name }} <i
                                class="bi bi-chevron-down toggle-dropdown"></i>
                        </a>
                        <ul>
                            <li><router-link to="/account/booking">My Account</router-link></li>
                            <li><a @click.prevent="logout" style="cursor: pointer;">Logout</a></li>
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
import api from "@/api"

const auth = useAuthStore()
const user = computed(() => auth.user)

const cartCount = ref(0)

async function fetchCart() {
    if (!auth.token) return
    try {
        const res = await api.get("/cart-list", {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        cartCount.value = res.data?.Data?.length || 0
    } catch (err) {
        console.error("Cart fetch error", err)
        cartCount.value = 0
    }
}

function logout() {
    auth.logout()
    cartCount.value = 0
}

onMounted(() => {
    if (auth.token) {
        fetchCart()
    }
})
</script>
