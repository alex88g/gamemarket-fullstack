// src/store/toast.js
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '',
    type: 'info', // 'success' | 'error' | 'info'
    timeoutId: null,
  }),
  actions: {
    push(msg, type='info', durationMs=3000) {
      this.message = msg
      this.type = type
      this.show = true

      if (this.timeoutId) clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        this.show = false
      }, durationMs)
    },
    hide() {
      this.show = false
      if (this.timeoutId) clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
})
