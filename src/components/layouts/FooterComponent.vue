<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';

const social = ref('');
onMounted(async () => {
  await fetchData();
});
async function fetchData() {
  try {
    const resSocial = await api.get('/social-media-list');

    if (resSocial.data?.Success) {
      social.value = resSocial.data.Data || null;
    }
    console.log(social);

  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    
  }
}
</script>
<template>
  <footer id="footer" class="footer position-relative dark-background">

    <!-- <div class="footer-newsletter">
        <div class="container">
          <div class="row justify-content-center text-center">
            <div class="col-lg-6">
              <h4>Join Our Newsletter</h4>
              <p>Subscribe to our newsletter and receive the latest news about our products and services!</p>
              <form action="forms/newsletter.php" method="post" class="php-email-form">
                <div class="newsletter-form"><input type="email" name="email"><input type="submit" value="Subscribe">
                </div>
                <div class="loading">Loading</div>
                <div class="error-message"></div>
                <div class="sent-message">Your subscription request has been sent. Thank you!</div>
              </form>
            </div>
          </div>
        </div>
      </div> -->

    <div class="container footer-top">
      <div class="row gy-4">
        <div class="col-lg-4 col-md-6 footer-about">
          <router-link to="/" class="d-flex align-items-center">
            <span class="sitename">Gojetter</span>
          </router-link>
          <div class="footer-contact pt-3">
            <p>A108 Adam Street</p>
            <p>New York, NY 535022</p>
            <p class="mt-3"><strong>Phone:</strong> <span>+1 5589 55488 55</span></p>
            <p><strong>Email:</strong> <span>info@example.com</span></p>
          </div>
        </div>

        <div class="col-lg-2 col-md-3 footer-links">
          <h4>Useful Links</h4>
          <ul>
            <li><i class="bi bi-chevron-right"></i> <router-link to="/about">About us</router-link></li>
            <li><i class="bi bi-chevron-right"></i> <router-link to="/faqs">FAQs</router-link></li>
            <li><i class="bi bi-chevron-right"></i> <router-link to="/privacy">Privacy</router-link></li>
            <li><i class="bi bi-chevron-right"></i> <router-link to="/terms">Terms & Conditions</router-link></li>
          </ul>
        </div>


        <div class="col-lg-4 col-md-12">
          <h4>Follow Us</h4>
          <p>Cras fermentum odio eu feugiat lide par naso tierra videa magna derita valies</p>
          <div class="social-links d-flex">
            <a v-for="link in social" :key="link.id" :href="link.url" target="_blank" rel="noopener noreferrer">
              <img :src="link.icon" :alt="link.name" style="width:24px;height:24px;" />
            </a>
          </div>
        </div>

      </div>
    </div>

    <div class="container copyright text-center mt-4">
      <p>© <span>Copyright</span> <strong class="px-1 sitename">Gojetter</strong> <span>All Rights Reserved</span></p>
    </div>

  </footer>
</template>