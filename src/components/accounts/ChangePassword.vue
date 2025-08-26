<script setup>
import { ref,computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/api"; // your axios instance
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/store/auth"; // assuming you have a Pinia/Vuex auth store

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const form = ref({
  password: "",
  password_confirmation: "",
});
const passwordsMatch = computed(() => {
  return (
    form.value.password &&
    form.value.password_confirmation &&
    form.value.password === form.value.password_confirmation
  );
});
const handleChangePassword = async () => {
  if (!passwordsMatch.value) {
    toast.error("Passwords do not match!");
    return;
  }
  try {
    loading.value = true;
    await api.post("/change-password", form.value, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    toast.success("Password updated successfully. Please login again.");

    // Clear token + user from store/localStorage
    authStore.logout();

    // Redirect to login
    router.push({ name: "login" });
  } catch (error) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Something went wrong. Try again.");
    }
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="card mb-3">
    <div class="card-header">
      Change Password
      <!-- Success / Error Messages -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
    </div>

    <form @submit.prevent="handleChangePassword">
      <div class="card-body">
        <!-- Change Password Form -->
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">New Password</label>
            <input type="password" v-model="form.password" class="form-control" required minlength="6" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Confirm Password</label>
            <input type="password" v-model="form.password_confirmation" class="form-control" required minlength="6" />
            <small v-if="form.password_confirmation && !passwordsMatch" class="text-danger">
              Passwords do not match
            </small>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="row">
          <div class="col-md-4 mt-2">
            <button type="submit" class="btn btn-primary" :disabled="loading || !passwordsMatch">
              <span v-if="loading">Updating...</span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.container {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
