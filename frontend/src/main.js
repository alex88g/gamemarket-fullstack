// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './store/auth.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Ladda auth-info från localStorage nu när pinia är aktiv
const auth = useAuthStore()
auth.loadFromStorage()

app.mount('#app')
