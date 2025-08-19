<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

const faqs = ref([]);
const activeFaq = ref(null)
const toggleFaq = (index) => {
    activeFaq.value = activeFaq.value === index ? null : index
}
onMounted(async () => {
    await fetchData();
});
async function fetchData() {
    try {
        const resFaqs = await api.get('/faqs');

        if (resFaqs.data?.Success) {
            faqs.value = resFaqs.data.Data || [];
        }
        console.log(faqs);

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
                <h1>Frequently Asked Questions</h1>
                <p>Esse dolorum voluptatum ullam est sint nemo et est ipsa porro placeat quibusdam quia assumenda
                    numquam molestias.</p>
                <nav class="breadcrumbs">
                    <ol>
                        <li><router-link to="/">Home</router-link></li>
                        <li class="current">Frequently Asked Questions</li>
                    </ol>
                </nav>
            </div>
        </div><!-- End Page Title -->

        <!-- Faq Section -->
        <section id="faq" class="faq section">

            <div class="container" data-aos="fade-up" data-aos-delay="100">

                <div class="row align-items-start gy-4">
                    <div class="col-lg-5" data-aos="fade-up" data-aos-delay="200">
                        <div class="faq-sidebar">
                            <div class="faq-image">
                                <img src="/assets/img/illustration/illustration-5.webp" alt="FAQ Image"
                                    class="img-fluid" loading="lazy">
                            </div>
                            <div class="contact-box">
                                <h3><i class="bi bi-headset"></i> Need Assistance?</h3>
                                <p>Donec rutrum congue leo eget malesuada. Quisque velit nisi, pretium ut lacinia in,
                                    elementum id enim.</p>
                                <router-link to="/contact" class="btn-contact">Connect with Support</router-link>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-7">
                        <div class="accordion">
                            <div v-for="(faq, index) in faqs" :key="index" class="faq-item" data-aos="fade-up"
                                data-aos-delay="150">
                                <div class="faq-question1" @click="toggleFaq(index)">
                                    <span>{{ faq?.question }}</span>
                                    <i :class="['arrow bi bi-chevron-down faq-toggle', { 'open bi bi-chevron-down faq-toggle': activeFaq === index }]"></i>
                                </div>
                                <div v-if="activeFaq === index" class="faq-content1">
                                    <span v-html="faq?.answer"></span>
                                </div>
                            </div><!-- End FAQ Item-->
                        </div>
                    </div>
                </div>
            </div>

        </section><!-- /Faq Section -->

    </main>

</template>
<style>
.faq-item {
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
}

.faq-question1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background-color: #fff;
    cursor: pointer;
    color: #000;
    font-weight: 500;
    text-decoration: none;
}

.arrow {
    transition: transform 0.3s ease;
}

.arrow.open {
    transform: rotate(180deg);
}

.faq-content1 {
    padding: 10px 14px;
    border-top: 1px solid #ccc;
    background-color: #fff;
    color: #555;
}
</style>