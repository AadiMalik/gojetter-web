<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';

const about = ref('');
onMounted(async () => {
    await fetchData();
});
async function fetchData() {
    try {
        const resAbout = await api.get('/about-us');

        if (resAbout.data?.Success) {
            about.value = resAbout.data.Data || null;
        }
        console.log(about);

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <main class="main">

        <!-- Page Title -->
        <div class="page-title dark-background" data-aos="fade"
            style="background-image: url(assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>About Us</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">About Us</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- about us Section -->
        <section id="privacy" class="privacy section">

            <div class="container" data-aos="fade-up" v-if="about">
                <!-- Header -->
                <div class="privacy-header" data-aos="fade-up">
                    <div class="header-content">
                        <h1>About Us</h1>
                        <p class="intro-text">This content describes how we collect, use, process, and disclose
                            your information, including personal information, in conjunction with your access to and use
                            of our services.</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="privacy-content" data-aos="fade-up">
                    <!-- Introduction -->
                    <div class="content-section" v-html="about.description">
                        
                    </div>
                </div>

            </div>

        </section><!-- /about us Section -->

    </main>

</template>