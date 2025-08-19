<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';

const privacy = ref('');
onMounted(async () => {
    await fetchData();
});
async function fetchData() {
    try {
        const resPrivacy = await api.get('/privacy-policy');

        if (resPrivacy.data?.Success) {
            privacy.value = resPrivacy.data.Data || null;
        }
        console.log(privacy);

    } catch (err) {
        console.error('Fetch error:', err);
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
            style="background-image: url(assets/img/travel/showcase-8.webp);">
            <div class="container position-relative">
                <h1>Privacy Policy</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Privacy Policy</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Privacy Section -->
        <section id="privacy" class="privacy section">

            <div class="container" data-aos="fade-up" v-if="privacy">
                <!-- Header -->
                <div class="privacy-header" data-aos="fade-up">
                    <div class="header-content">
                        <div class="last-updated">Effective Date: {{formatDate(privacy?.updated_at)}}</div>
                        <h1>Privacy Policy</h1>
                        <p class="intro-text">This Privacy Policy describes how we collect, use, process, and disclose
                            your information, including personal information, in conjunction with your access to and use
                            of our services.</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="privacy-content" data-aos="fade-up">
                    <!-- Introduction -->
                    <div class="content-section" v-html="privacy.description">
                        
                    </div>
                </div>

            </div>

        </section><!-- /Privacy Section -->

    </main>

</template>