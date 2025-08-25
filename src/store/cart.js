import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'   // ✅ import router
import api from '@/api'

export const useCartStore = defineStore('cart', () => {
      const carts = ref([])
      const token = ref(localStorage.getItem('token') || null)
      const user = ref(JSON.parse(localStorage.getItem('user')) || null)
      const router = useRouter()   // ✅ define router

      // fetch cart items
      async function fetchCart() {
            try {
                  const res = await api.get('/cart-list', {
                        headers: {
                              Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                  })
                  if (res.data?.Status === 401) {
                        // logout logic
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login'); // redirect to login
                        return;
                  }
                  if (res.data?.Success) {
                        carts.value = res.data.Data || []
                  }
            } catch (err) {
                  if (err.response?.status === 401) {
                        logout()
                  } else {
                        console.error('Cart fetch error:', err)
                  }
            }
      }

      // delete cart record
      async function deleteCart(cartId) {
            try {
                  const res = await api.post(
                        `/delete-cart/${cartId}`,
                        {},
                        {
                              headers: {
                                    Authorization: `Bearer ${localStorage.getItem('token')}`
                              }
                        }
                  )
                  if (res.data?.Status === 401) {
                        // logout logic
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login'); // redirect to login
                        return;
                  }
                  if (res.data?.Success) {
                        carts.value = carts.value.filter(c => c.id !== cartId)
                  }
                  return res
            } catch (err) {
                  if (err.response?.status === 401) {
                        logout()
                  } else {
                        console.error('Cart delete error:', err)
                  }
            }
      }

      // ✅ logout function
      function logout() {
            token.value = null
            user.value = null
            localStorage.clear()
            carts.value = []
            router.push('/login')   // redirect to login route
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

      return { carts, token, user, fetchCart, deleteCart, cartCount, cartTotal, logout }
})
