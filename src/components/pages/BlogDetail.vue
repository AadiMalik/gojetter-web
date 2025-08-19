<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const loading = ref(true)
const blog = ref(null)
const categories = ref([])


const route = useRoute()
const router = useRouter()
const currentUrl = window.location.origin + route.fullPath
const encodedUrl = encodeURIComponent(currentUrl)

const fetchBlog = async () => {
      const slug = route.params.slug
      if (!slug) {
            router.push('/blogs')
            return
      }

      loading.value = true
      try {
            const res = await api.get(`/blog-by-slug/${slug}`)
            if (res.data?.Success && res.data?.Data) {
                  blog.value = res.data.Data
            } else {
                  router.push('/blogs')
            }
      } catch (error) {
            console.error(error)
            router.push('/blogs')
      } finally {
            loading.value = false
      }
}

const fetchCategories = async () => {
      try {
            const res = await api.get(`/blog-category-list`)
            if (res.data?.Success) {
                  categories.value = res.data.Data || []
            }
      } catch (error) {
            console.error(error)
      }
}
const goToCategory = (catId) => {
  router.push({
    path: '/blogs',
    query: { category_id: catId }
  })
}

onMounted(() => {
      fetchBlog()
      fetchCategories()

})

// 👀 Watch for route slug change
watch(
      () => route.params.slug,
      () => {
            fetchBlog()
            window.scrollTo({
                  top: 0,
                  behavior: 'smooth' // smooth scrolling
            })
      }
)
const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
      })
}
</script>

<template>
      <main class="main">

            <!-- Page Title -->
            <div class="page-title dark-background" data-aos="fade"
                  style="background-image: url(/assets/img/travel/showcase-8.webp);">
                  <div class="container position-relative">
                        <h1>Blog Details</h1>
                        <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia
                              assumenda numquam molestias.</p>
                        <nav class="breadcrumbs">
                              <ol>
                                    <li><router-link to="/">Home</router-link></li>
                                    <li class="current">Blog Details</li>
                              </ol>
                        </nav>
                  </div>
            </div><!-- End Page Title -->

            <!-- Blog Details Section -->
            <section id="blog-details" class="blog-details section">
                  <div class="container" data-aos="fade-up">

                        <article class="article">
                              <div class="article-header">
                                    <div class="meta-categories" data-aos="fade-up">
                                          <a  href="javascript:void(0)" @click="goToCategory(blog?.blog_category_id)" class="category">{{ blog?.category.name }}</a>
                                    </div>

                                    <h1 class="title" data-aos="fade-up" data-aos-delay="100">{{ blog?.title }}</h1>

                                    <div class="article-meta" data-aos="fade-up" data-aos-delay="200">
                                          <div class="author">
                                                <img src="/assets/img/person/demoUser.png" alt="Author"
                                                      class="author-img">
                                                <div class="author-info">
                                                      <h4>{{ blog?.author }}</h4>
                                                      <!-- <span>UI/UX Design Lead</span> -->
                                                </div>
                                          </div>
                                          <div class="post-info">
                                                <span><i class="bi bi-calendar4-week"></i> {{
                                                      formatDate(blog?.created_at) }}</span>
                                                <!-- <span><i class="bi bi-clock"></i> 10 min read</span>
                                                <span><i class="bi bi-chat-square-text"></i> 32 Comments</span> -->
                                          </div>
                                    </div>
                              </div>

                              <div class="article-featured-image" data-aos="zoom-in" v-if="blog?.image_url">
                                    <img :src="blog?.image_url" alt="" class="img-fluid">
                              </div>
                              <div class="article-featured-image" data-aos="zoom-in" v-if="blog?.video_url">
                                    <iframe class="img-fluid" :src="blog?.video_url" style="width: 100%; height: 100%;"></iframe>
                              </div>

                              <div class="article-wrapper">
                                    <aside class="table-of-contents" data-aos="fade-left">
                                          <h3>Categories</h3>
                                          <nav>
                                                <ul>
                                                      <li v-for="cat in categories" :key="cat.id">
                                                            <a href="javascript:void(0)" @click="goToCategory(cat.id)">
                                                                  {{ cat.name }}
                                                            </a>
                                                      </li>
                                                </ul>
                                          </nav>
                                    </aside>

                                    <div class="article-content">
                                          <div class="content-section" id="introduction" data-aos="fade-up">
                                                <p class="lead" v-html="blog?.short_description">
                                                </p>

                                                <p v-html="blog?.description">
                                                </p>
                                          </div>

                                    </div>
                              </div>

                              <div class="article-footer" data-aos="fade-up">
                                    <div class="share-article">
                                          <h4>Share this article</h4>
                                          <div class="share-buttons">
                                                <a :href="`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${blog?.title}`"
                                                      class="share-button twitter" target="_blank">
                                                      <i class="bi bi-twitter"></i>
                                                      <span>Share on X</span>
                                                </a>
                                                <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`"
                                                      target="_blank" class="share-button facebook">
                                                      <i class="bi bi-facebook"></i>
                                                      <span>Share on Facebook</span>
                                                </a>
                                                <a :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`"
                                                      target="_blank" class="share-button linkedin">
                                                      <i class="bi bi-linkedin"></i>
                                                      <span>Share on LinkedIn</span>
                                                </a>
                                          </div>
                                    </div>
                              </div>

                        </article>

                  </div>
            </section><!-- /Blog Details Section -->

      </main>

</template>