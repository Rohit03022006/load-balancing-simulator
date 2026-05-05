import axios from 'axios'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for long simulations
})

const generateUUID = () => {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const bytes = typeof crypto?.getRandomValues === 'function'
    ? crypto.getRandomValues(new Uint8Array(16))
    : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.headers = config.headers || {}
    config.headers['X-Request-ID'] = generateUUID()
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred'
    
    if (error.response?.status === 429) {
      toast.error('Rate limit exceeded. Please wait a moment.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. The simulation may be taking longer than expected.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // Simulations
  createSimulation: (config) => apiClient.post('/simulate', config),
  runSyncSimulation: (config) => apiClient.post('/simulate/sync', config),
  getSimulation: (id) => apiClient.get(`/results/${id}`),
  getSimulationStatus: (id) => apiClient.get(`/simulations/${id}/status`),
  listSimulations: (params) => apiClient.get('/simulations', { params }),
  cancelSimulation: (id) => apiClient.delete(`/simulations/${id}`),
  getRunningSimulations: () => apiClient.get('/simulations/running'),
  
  // Algorithms
  getAlgorithms: () => apiClient.get('/algorithms'),
  compareAlgorithms: (configs) => apiClient.post('/simulate/compare', { configs }),
  
  // Health
  healthCheck: () => apiClient.get('/health'),
}

export default apiClient