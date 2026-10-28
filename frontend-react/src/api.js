import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export const busPassApi = {
  list: () => api.get('/BusPass/displayall'),
  find: (id) => api.get('/BusPass/displaybyid', { params: { id } }),
  create: (pass) => api.post('/BusPass/add', pass),
  update: (id, pass) => api.put(`/BusPass/update/${id}`, pass),
  remove: (id) => api.delete(`/BusPass/delete/${id}`),
}

export function getErrorMessage(error) {
  const data = error.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (error.request) return 'Cannot reach CrudService. Check that the backend is running on port 8081.'
  return error.message || 'Something went wrong. Please try again.'
}
