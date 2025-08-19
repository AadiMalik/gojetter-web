<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';

const terms = ref('');
onMounted(async () => {
    await fetchData();
});
async function fetchData() {
    try {
        const resTerms = await api.get('/term-and-condition');

        if (resTerms.data?.Success) {
            terms.value = resTerms.data.Data || null;
        }
        console.log(terms);

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        
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
                <h1>Terms and Conditions</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Terms and Conditions</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Terms Of Service Section -->
        <section id="terms-of-service" class="terms-of-service section">

            <div class="container" data-aos="fade-up">
                <!-- Page Header -->
                <div class="tos-header text-center" data-aos="fade-up">
                    <span class="last-updated">Last Updated: {{formatDate(terms?.updated_at)}}</span>
                    <h2>Terms and Conditions</h2>
                    <p>Please read these terms and condition carefully before using our services</p>
                </div>

                <!-- Content -->
                <div class="tos-content" data-aos="fade-up" data-aos-delay="200">
                    <!-- Agreement Section -->
                    <div  class="content-section" v-html="terms?.description">
                    </div>
                </div>
            </div>

        </section><!-- /Terms Of Service Section -->
    </main>
</template>