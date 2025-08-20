import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useCartStore = defineStore('cart', () => {
      const carts = ref([])

      // fetch cart items
      async function fetchCart() {
            try {
                  const res = await api.get('/cart-list', {
                        headers: {
                              Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                  })
                  if (res.data?.Success) {
                        carts.value = res.data.Data || []
                  }
            } catch (err) {
                  console.error('Cart fetch error:', err)
            }
      }

      // delete cart record
      async function deleteCart(cartId) {
            try {
                  const res = await api.post(
                        `/delete-cart/${cartId}`,
                        {}, // empty body
                        {
                              headers: {
                                    Authorization: `Bearer ${localStorage.getItem('token')}`
                              }
                        }
                  )

                  if (res.data?.Success) {
                        // remove from local state so UI (header, cart page) updates
                        carts.value = carts.value.filter(c => c.id !== cartId)
                  }
                  return res
            } catch (err) {
                  console.error('Cart delete error:', err)
            }
      }

      // ✅ computed: total items in cart
      const cartCount = computed(() =>
            carts.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
      )

      // ✅ computed: total price of cart
      const cartTotal = computed(() =>
            carts.value.reduce((sum, item) => {
                  const price = (item?.activity_date?.discount_price && item?.activity_date?.discount_price > 0)
                        ? item.activity_date.discount_price
                        : item?.activity_date?.price || 0
                  return sum + price * (item.quantity || 0)
            }, 0)
      )

      return { carts, fetchCart, deleteCart, cartCount, cartTotal }
})
