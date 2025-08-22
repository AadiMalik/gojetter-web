<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const bookings = ref([]);
const searchQuery = ref('');
const selectedBooking = ref(null);
const loading = ref(true);

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    const resBooking = await api.get('/booking-list', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // ✅ auth token
      }
    });

    if (resBooking.data?.Success) {
      bookings.value = resBooking.data.Data || [];
    }
    console.log(bookings.value);

  } catch (err) {
    console.error('Fetch error:', err);
    toast.error('Failed to load bookings');
  } finally {
    loading.value = false;
  }
}

// format date utility
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

// open modal and set selected booking
function showBookingDetails(booking) {
  selectedBooking.value = booking;
  const modalEl = document.getElementById('bookingDetailsModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
</script>

<template>
  <!-- Bookings Table -->
  <div class="card">
    <div class="card-header">
        Bookings
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover order-table mb-0">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(booking,index) in bookings" :key="booking.id">
              <td class="fw-semibold">{{ index+1 }}</td>
              <td>{{ booking.first_name }} {{ booking.last_name }}</td>
              <td>{{ formatDate(booking.booking_date) }}</td>
              <td class="fw-semibold">{{ booking.currency.symbol }} {{ booking.total }}</td>
              <td>
                <span class="text-capitalize">{{ booking.payment_method.replace('_', ' ') }}</span>
              </td>
              <td>
                <span :class="['status-badge', 'status-' + booking.status]">
                  {{ booking.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm view-btn btn-outline-primary" @click="showBookingDetails(booking)">
                  <i class="fas fa-eye me-1"></i> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Booking Details Modal -->
  <div class="modal fade" id="bookingDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Booking Details - #{{ selectedBooking?.id }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedBooking">
            <!-- Booking Summary -->
            <div class="detail-section">
              <h6 class="detail-section-title">Booking Summary</h6>
              <div class="row">
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Booking Date</div>
                    <div>{{ formatDate(selectedBooking.booking_date) }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Tour Date</div>
                    <div>{{ formatDate(selectedBooking.tour_date.start_date) }} - {{ formatDate(selectedBooking.tour_date.end_date) }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Participants</div>
                    <div>{{ selectedBooking.total_participants }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Status</div>
                    <div>
                      <span :class="['status-badge', 'status-' + selectedBooking.status]">
                        {{ selectedBooking.status }}
                      </span>
                    </div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Payment Method</div>
                    <div class="text-capitalize">{{ selectedBooking.payment_method.replace('_', ' ') }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Subtotal</div>
                    <div>{{ selectedBooking.currency.symbol }} {{ selectedBooking.sub_total }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Discount</div>
                    <div>{{ selectedBooking.currency.symbol }} {{ selectedBooking.discount }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Total</div>
                    <div class="fw-semibold">{{ selectedBooking.currency.symbol }} {{ selectedBooking.total }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="detail-section">
              <hr>
              <h6 class="detail-section-title">Customer Information</h6>
              <div class="row">
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Name</div>
                    <div>{{ selectedBooking.first_name }} {{ selectedBooking.last_name }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Email</div>
                    <div>{{ selectedBooking.email }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Phone</div>
                    <div>{{ selectedBooking.phone }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Address</div>
                    <div>{{ selectedBooking.address }}, {{ selectedBooking.country }} {{ selectedBooking.zipcode }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking Items -->
            <div class="detail-section">
              <hr>
              <h6 class="detail-section-title">Participants Detail</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Date of Birth</th>
                      <th>Weight Unit</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in selectedBooking.booking_detail" :key="index">
                      <td>{{ item.first_name }} {{ item.last_name }}</td>
                      <td>{{ item.type }}</td>
                      <td>{{ item.dob }}</td>
                      <td>{{ item.weight_unit }}</td>
                      <td>{{ item.weight }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <!-- <button type="button" class="btn btn-primary">Print Invoice</button> -->
        </div>
      </div>
    </div>
  </div>
</template>