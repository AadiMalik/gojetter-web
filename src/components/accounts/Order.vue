<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api';
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const orders = ref([]);
const searchQuery = ref('');
const selectedOrder = ref(null);
const loading = ref(true);

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    const resOrder = await api.get('/order-list', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // ✅ auth token
      }
    });

    if (resOrder.data?.Success) {
      orders.value = resOrder.data.Data || [];
    }
    console.log(orders.value);

  } catch (err) {
    console.error('Fetch error:', err);
    toast.error('Failed to load orders');
  } finally {
    loading.value = false;
  }
}

// format date utility
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

// open modal and set selected order
function showOrderDetails(order) {
  selectedOrder.value = order;
  const modalEl = document.getElementById('orderDetailsModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
</script>

<template>
  <!-- Orders Table -->
  <div class="card">
    <div class="card-header">
          Orders
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
            <tr v-for="(order,index) in orders" :key="order.id">
              <td class="fw-semibold">{{ index+1 }}</td>
              <td>{{ order.first_name }} {{ order.last_name }}</td>
              <td>{{ formatDate(order.order_date) }}</td>
              <td class="fw-semibold">{{ order.currency.symbol }} {{ order.total }}</td>
              <td>
                <span class="text-capitalize">{{ order.payment_method.replace('_', ' ') }}</span>
              </td>
              <td>
                <span :class="['status-badge', 'status-' + order.status]">
                  {{ order.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm view-btn btn-outline-primary" @click="showOrderDetails(order)">
                  <i class="fas fa-eye me-1"></i> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Order Details Modal -->
  <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Order Details - #{{ selectedOrder?.id }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedOrder">
            <!-- Order Summary -->
            <div class="detail-section">
              <h6 class="detail-section-title">Order Summary</h6>
              <div class="row">
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Order Date</div>
                    <div>{{ formatDate(selectedOrder.order_date) }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Status</div>
                    <div>
                      <span :class="['status-badge', 'status-' + selectedOrder.status]">
                        {{ selectedOrder.status }}
                      </span>
                    </div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Payment Method</div>
                    <div class="text-capitalize">{{ selectedOrder.payment_method.replace('_', ' ') }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Subtotal</div>
                    <div>{{ selectedOrder.currency.symbol }} {{ selectedOrder.sub_total }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Discount</div>
                    <div>{{ selectedOrder.currency.symbol }} {{ selectedOrder.discount }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Total</div>
                    <div class="fw-semibold">{{ selectedOrder.currency.symbol }} {{ selectedOrder.total }}</div>
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
                    <div>{{ selectedOrder.first_name }} {{ selectedOrder.last_name }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Email</div>
                    <div>{{ selectedOrder.email }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="order-detail-item">
                    <div class="detail-label">Phone</div>
                    <div>{{ selectedOrder.phone }}</div>
                  </div>
                  <div class="order-detail-item">
                    <div class="detail-label">Address</div>
                    <div>{{ selectedOrder.address }}, {{ selectedOrder.country }} {{ selectedOrder.zipcode }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="detail-section">
              <hr>
              <h6 class="detail-section-title">Order Items</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in selectedOrder.order_detail" :key="index">
                      <td>{{ item.activity.title }}</td>
                      <td>{{ formatDate(item.activity_date.date) }}</td>
                      <td>{{ item.activity_time_slot.start_time }} - {{ item.activity_time_slot.end_time }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ selectedOrder.currency.symbol }} {{ item.price }}</td>
                      <td>{{ selectedOrder.currency.symbol }} {{ item.total }}</td>
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