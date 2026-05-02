import axios from 'axios'
import { config } from '@/lib/config'

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — add auth / logging in dev
api.interceptors.request.use(
  (req) => {
    if (config.isDev) {
      console.debug(`[API] ${req.method?.toUpperCase()} ${req.url}`)
    }
    return req
  },
  (error) => Promise.reject(error)
)

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    if (config.isDev) {
      console.error('[API Error]', message, error.response?.status)
    }

    const enriched = new Error(message)
    enriched.status = error.response?.status
    enriched.data = error.response?.data
    return Promise.reject(enriched)
  }
)

export default api