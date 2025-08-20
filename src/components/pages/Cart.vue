<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { toast } from 'vue3-toastify'

import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const { carts } = storeToRefs(cartStore)
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
      cartStore.fetchCart()
})

// ✅ Update quantity
async function updateQuantity(item, newQty) {
      try {
            const res = await api.post(
                  '/save-cart',
                  {
                        activity_id: item.activity.id,
                        activity_date_id: item.activity_date.id,
                        activity_time_slot_id: item.activity_time_slot.id,
                        quantity: newQty
                  },
                  {
                        headers: {
                              Authorization: `Bearer ${auth.token}`
                        }
                  }
            )

            if (res.data?.Success) {
                  item.quantity = newQty
                  toast.success("Cart updated successfully")
            } else {
                  toast.error(res.data?.Message || "Failed to update cart")
            }
      } catch (err) {
            if (err.response?.status === 401) {
                  auth.logout()
                  toast.error("Your session has expired. Please login again.")
                  router.push('/login')
            } else {
                  toast.error("Error while updating cart")
            }
      }
}

// ✅ Delete cart item
async function deleteCart(cartId) {
      const res = await cartStore.deleteCart(cartId)
      if (res?.data?.Success) {
            toast.success("Item removed from cart")
      } else {
            toast.error(res?.data?.Message || "Failed to delete item")
      }
}

// ✅ Helper
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
            <div class="page-title dark-background" data-aos="fade"
                  style="background-image: url(assets/img/travel/showcase-8.webp);">
                  <div class="container position-relative">
                        <h1>Cart</h1>
                        <nav class="breadcrumbs">
                              <ol>
                                    <li><router-link to="/">Home</router-link></li>
                                    <li class="current">Cart</li>
                              </ol>
                        </nav>
                  </div>
            </div>

            <section class="terms-of-service section">
                  <div class="container" data-aos="fade-up" data-aos-delay="200">
                        <div class="row">
                              <div class="col-md-12">
                                    <h4>Cart</h4>
                                    <hr>
                              </div>
                              <div class="col-md-12">
                                    <table class="table table-bordered" width="100%">
                                          <thead>
                                                <tr>
                                                      <th class="text-center">Sr.</th>
                                                      <th class="text-center">Activity</th>
                                                      <th class="text-center">Date</th>
                                                      <th class="text-center">Time Slot</th>
                                                      <th class="text-center">Quantity</th>
                                                      <th class="text-center">Total</th>
                                                      <th class="text-center">Action</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                <tr v-for="(item, index) in carts" :key="item.id">
                                                      <td class="text-center">{{ index + 1 }}</td>
                                                      <td>
                                                            {{ item?.activity?.title }} <br>
                                                            {{ (item?.activity_date?.discount_price &&
                                                                  item?.activity_date?.discount_price > 0)
                                                                  ? item?.activity_date?.discount_price
                                                            : item?.activity_date?.price }}
                                                      </td>
                                                      <td class="text-center">
                                                            {{ formatDate(item?.activity_date?.date) }}
                                                      </td>
                                                      <td class="text-center">
                                                            {{ item?.activity_time_slot.start_time }} -
                                                            {{ item?.activity_time_slot.end_time }}
                                                      </td>
                                                      <td style="text-align:right;">
                                                            <input type="number" min="1" :value="item.quantity"
                                                                  @change="updateQuantity(item, $event.target.value)"
                                                                  style="width: 70px; text-align: right;" />
                                                      </td>
                                                      <td style="text-align:right;">
                                                            {{
                                                                  ((item?.activity_date?.discount_price &&
                                                                        item?.activity_date?.discount_price > 0)
                                                                        ? item?.activity_date?.discount_price
                                                            : item?.activity_date?.price) * item?.quantity
                                                            }}
                                                      </td>
                                                      <td class="text-center">
                                                            <a href="#" class="text-danger"
                                                                  @click.prevent="deleteCart(item.id)">
                                                                  <span class="bi bi-trash"></span>
                                                            </a>
                                                      </td>
                                                </tr>
                                          </tbody>
                                          <tfoot>
                                                <tr>
                                                      <th colspan="4" style="text-align:right;">Total</th>
                                                      <th style="text-align:right;">{{ cartStore.cartCount }}</th>
                                                      <th style="text-align:right;">{{ cartStore.cartTotal }}</th>
                                                      <th></th>
                                                </tr>
                                          </tfoot>
                                    </table>
                              </div>
                        </div>
                  </div>
            </section>
      </main>
</template>