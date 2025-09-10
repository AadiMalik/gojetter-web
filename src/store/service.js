import { defineStore } from "pinia"
import api from "@/api"

export const useServiceStore = defineStore("service", {
  state: () => ({
    services: [],
  }),
  actions: {
    async fetchServices() {
      try {
        const res = await api.get("/service-list")
        if (res.data?.Success) {
          this.services = res.data.Data || []
        }
      } catch (err) {
        console.error("services fetch error:", err)
      }
    },
  },
})
