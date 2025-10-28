// src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// Lägg till Authorization-header automatiskt
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    } catch (e) {
      // ignore
    }
  }
  return config
})

export default api
