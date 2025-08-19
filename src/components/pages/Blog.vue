<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

const blogs = ref([]);
const categories = ref([]);

const selectedCategory = ref('');

const loading = ref(true);

onMounted(async () => {
    await fetchCategories(); // always load categories first

    // check if category_id exists in query params
    const catId = route.query.category_id ? parseInt(route.query.category_id) : null;
    if (catId) {
        selectedCategory.value = catId;
        await fetchBlogs(catId);
    } else {
        await fetchData();
    }
});
// ✅ Fetch categories only once
async function fetchCategories() {
    try {
        const res = await api.get('/blog-category-list');
        if (res.data?.Success) {
            categories.value = res.data.Data || [];
        }
    } catch (err) {
        console.error('Categories fetch error:', err);
    }
}
async function fetchData() {
    try {
        const [blogRes, categoriesRes] = await Promise.all([
            api.get('/blog-list'),
            api.get('/blog-category-list')
        ]);

        if (blogRes.data?.Success) {
            blogs.value = blogRes.data.Data || [];
        }

        if (categoriesRes.data?.Success) {
            categories.value = categoriesRes.data.Data || [];
        }

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
}

// Fetch blogs with filters
async function fetchBlogs(cat) {
    try {
        loading.value = true;

        selectedCategory.value = cat;

        const params = {};
        if (cat) {
            params.category_id = cat;
        }

        const res = await api.get('/blog-list', { params });

        if (res.data?.Success) {
            blogs.value = res.data.Data || [];
        }
    } catch (err) {
        console.error('Filter fetch error:', err);
    } finally {
        loading.value = false;
    }
}
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
                <h1>Blog</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Blog</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->


        <div class="row">
            <div class="col-md-3" style="padding: 60px 0;">
                <div class="list-group">
                    <button class="list-group-item list-group-item-action bg-primary text-white"
                        @click="fetchBlogs(null)">
                        <b>Categories</b>
                    </button>
                    <button v-for="cat in categories" :key="cat.id" class="list-group-item list-group-item-action"
                        :class="{ active: selectedCategory === cat.id }" @click="fetchBlogs(cat.id)">
                        {{ cat.name }}
                    </button>
                </div>
            </div>
            <div class="col-md-9">
                <!-- Blog Posts Section -->
                <section id="blog-posts" class="blog-posts section">

                    <div class="container" data-aos="fade-up" data-aos-delay="100">
                        <div class="row gy-4">
                            <div v-if="loading" class="text-center">Loading blogs...</div>
                            <div v-else-if="!blogs.length" class="text-center">No blogs found.</div>
                            <div class="col-lg-4" v-for="blog in blogs">
                                <article>

                                    <div class="post-img">
                                        <img :src="blog.image_url ? blog.image_url : '/assets/img/blog/blog-post-1.webp'"
                                            alt="" class="img-fluid">
                                    </div>

                                    <p class="post-category">{{ blog.category.name }}</p>

                                    <h2 class="title">
                                        <router-link :to="`/blog-detail/${blog.slug}`">{{ blog.title }}</router-link>
                                    </h2>

                                    <div class="d-flex align-items-center">
                                        <img src="/assets/img/person/demoUser.png" alt=""
                                            class="img-fluid post-author-img flex-shrink-0">
                                        <div class="post-meta">
                                            <p class="post-author">{{ blog.author }}</p>
                                            <p class="post-date">
                                                <time datetime="{{formatDate(blog.created_at)}}">{{
                                                    formatDate(blog.created_at) }}</time>
                                            </p>
                                        </div>
                                    </div>

                                </article>
                            </div><!-- End post list item -->

                        </div>
                    </div>

                </section><!-- /Blog Posts Section -->

                <!-- Pagination 2 Section -->
                <!-- <section id="pagination-2" class="pagination-2 section">

                    <div class="container">
                        <div class="d-flex justify-content-center">
                            <ul>
                                <li><a href="#"><i class="bi bi-chevron-left"></i></a></li>
                                <li><a href="#">1</a></li>
                                <li><a href="#" class="active">2</a></li>
                                <li><a href="#">3</a></li>
                                <li><a href="#">4</a></li>
                                <li>...</li>
                                <li><a href="#">10</a></li>
                                <li><a href="#"><i class="bi bi-chevron-right"></i></a></li>
                            </ul>
                        </div>
                    </div>

                </section> -->
                <!-- /Pagination 2 Section -->
            </div>
        </div>

    </main>

</template>
<style>
body {
    overflow-x: hidden;
}
</style>