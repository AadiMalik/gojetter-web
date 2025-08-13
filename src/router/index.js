// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth';

// Import pages
import Home from '@/components/pages/Home.vue'
import About from '@/components/pages/About.vue'
import Destinations from '@/components/pages/Destinations.vue'
import Tour from '@/components/pages/Tour.vue'
import Activity from '@/components/pages/Activity.vue'
import Gallary from '@/components/pages/Gallary.vue'
import Blog from '@/components/pages/Blog.vue'
import Testimonials from '@/components/pages/Testimonials.vue'
import Faqs from '@/components/pages/Faqs.vue'
import Terms from '@/components/pages/Terms.vue'
import Privacy from '@/components/pages/Privacy.vue'
import Contact from '@/components/pages/Contact.vue'
import Login from '@/components/auth/Login.vue'
import Register from '@/components/auth/Register.vue'
import Otp from '@/components/auth/Otp.vue'
import ForgetPassword from '@/components/auth/ForgetPassword.vue'
import ResetPassword from '@/components/auth/ResetPassword.vue'
import Account from '@/components/accounts/Account.vue'
import Booking from '@/components/accounts/Booking.vue'
import Order from '@/components/accounts/Order.vue'
import UpdateProfile from '@/components/accounts/UpdateProfile.vue'
import ChangePassword from '@/components/accounts/ChangePassword.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/otp-verify', component: Otp },
  { path: '/forgot-password', component: ForgetPassword },
  { path: '/reset-password', component: ResetPassword },
  { path: '/about', component: About },
  { path: '/destinations', component: Destinations },
  { path: '/tours', component: Tour },
  { path: '/activity', component: Activity },
  { path: '/gallary', component: Gallary },
  { path: '/blogs', component: Blog },
  { path: '/testimonials', component: Testimonials },
  { path: '/faqs', component: Faqs },
  { path: '/terms', component: Terms },
  { path: '/privacy', component: Privacy },
  { path: '/contact', component: Contact },


  {
    path: '/account',
    component: Account,
    meta: { requiresAuth: true },
    children: [
      { path: 'booking', component: Booking },
      { path: 'order', component: Order },
      { path: 'update-profile', component: UpdateProfile },
      { path: 'change-password', component: ChangePassword }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const isLoggedIn = !!auth.user

  if (to.path === '/login' && isLoggedIn) {
    // Redirect logged-in users from login to account
    next('/account/booking')
  } else if (to.meta.requiresAuth && !isLoggedIn) {
    // Redirect unauthenticated users to login
    next('/login')
  } else {
    next()
  }
})


export default router
