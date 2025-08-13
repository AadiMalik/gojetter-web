// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

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
const routes = [
  { path: '/', component: Home },
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
