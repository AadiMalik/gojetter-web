import { defineStore } from "pinia"
import api from "@/api"

export const useCurrencyStore = defineStore("currency", {
      state: () => ({
            currencies: [],
            selected: { code: "USD", symbol: "$", rate: 1 }, // default
      }),
      actions: {
            async fetchCurrencies() {
                  try {
                        const res = await api.get("/currency-list")
                        this.currencies = res.data.Data || []

                        // set default
                        const def = this.currencies.find(c => c.is_default === 1)
                        if (def) {
                              this.selected = {
                                    code: def.code,
                                    symbol: def.symbol,
                                    rate: parseFloat(def.rate),
                              }
                        }
                  } catch (err) {
                        console.error("Currency fetch error", err)
                  }
            },
            changeCurrency(currency) {
                  this.selected = {
                        id: currency.id,
                        code: currency.code,
                        symbol: currency.symbol,
                        rate: parseFloat(currency.rate),
                  }
            },
            format(amount) {
                  if (!amount) return ""
                  const rate = this.selected?.rate || 1
                  const symbol = this.selected?.symbol || "$"
                  const converted = amount * rate
                  return `${symbol} ${converted.toFixed(0)}`
            },
      },
})
