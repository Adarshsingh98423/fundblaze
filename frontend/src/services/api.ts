import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fb_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — unwrap data
api.interceptors.response.use(
  (response) => {
    if (response.data && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
        const newToken = data?.data?.accessToken || data?.accessToken
        if (newToken) {
          localStorage.setItem('fb_access_token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('fb_access_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
