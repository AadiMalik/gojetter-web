<template>
  <div class="card mb-3">
    <div class="card-header">
      Update Profile
    </div>

    <form @submit.prevent="handleUpdateProfile" enctype="multipart/form-data">
      <div class="card-body">
        <div class="row">
          <!-- Name -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Name</label>
            <input type="text" v-model="form.name" class="form-control" required />
          </div>

          <!-- Phone -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Phone</label>
            <input type="text" v-model="form.phone" class="form-control" required />
          </div>

          <!-- Gender -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Gender</label>
            <select v-model="form.gender" class="form-select" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Country -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Country</label>
            <select v-model="form.country_id" class="form-select" required>
              <option value="">Select Country</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name }}
              </option>
            </select>
          </div>
          <!-- Show Email & Phone -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Show Email & Phone?</label>
            <select v-model="form.is_show_email_phone" class="form-select" required>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <!-- Home Airport -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Home Airport</label>
            <input type="text" v-model="form.home_airport" class="form-control" required />
          </div>

          <!-- State -->
          <div class="col-md-6 mb-3">
            <label class="form-label">State</label>
            <input type="text" v-model="form.state" class="form-control" />
          </div>

          <!-- City -->
          <div class="col-md-6 mb-3">
            <label class="form-label">City</label>
            <input type="text" v-model="form.city" class="form-control" />
          </div>

          <!-- Address -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Address</label>
            <input type="text" v-model="form.address" class="form-control" />
          </div>

          <!-- Zip Code -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Zip Code</label>
            <input type="text" v-model="form.zip_code" class="form-control" />
          </div>

          <!-- PayPal Email -->
          <div class="col-md-6 mb-3">
            <label class="form-label">PayPal Email</label>
            <input type="email" v-model="form.paypal_email" class="form-control" />
          </div>

          <!-- Alternative Phone -->
          <div class="col-md-6 mb-3">
            <label class="form-label">Alternative Phone</label>
            <input type="text" v-model="form.alternative_phone" class="form-control" />
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">Updating...</span>
          <span v-else>Update Profile</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();

const loading = ref(false);
const countries = ref([]); // you can fetch from API

// Pre-fill with user data
const form = ref({
  name: authStore.user?.name || "",
  phone: authStore.user?.phone || "",
  gender: authStore.user?.gender || "",
  country_id: authStore.user?.country_id || "",
  is_show_email_phone: authStore.user?.is_show_email_phone || 0,
  home_airport: authStore.user?.home_airport || "",
  state: authStore.user?.state || "",
  city: authStore.user?.city || "",
  address: authStore.user?.address || "",
  zip_code: authStore.user?.zip_code || "",
  paypal_email: authStore.user?.paypal_email || "",
  alternative_phone: authStore.user?.alternative_phone || "",
});

const handleUpdateProfile = async () => {
  try {
    loading.value = true;

    const formData = new FormData();
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null && form.value[key] !== undefined) {
        formData.append(key, form.value[key]);
      }
    });

    const res = await api.post("/update-profile", formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data?.Success) {
      toast.success(res.data.Message || "Profile updated successfully.");

      // Update user in auth store and localStorage
      authStore.user = res.data.Data;
      localStorage.setItem("user", JSON.stringify(res.data.Data));
    } else {
      toast.error(res.data?.Message || "Failed to update profile.");
    }
  } catch (error) {
    console.error(error);
    if (error.response?.data?.Message) {
      toast.error(error.response.data.Message);
    } else {
      toast.error("Something went wrong. Try again.");
    }
  } finally {
    loading.value = false;
  }
};



// Example: fetch countries from backend if needed
onMounted(async () => {

  if (authStore.user) {
    form.value = { ...authStore.user };
  }

  try {
    const res = await api.get("country-list");
    countries.value = res.data.Data;
  } catch {
    countries.value = [];
  }
});
</script>
