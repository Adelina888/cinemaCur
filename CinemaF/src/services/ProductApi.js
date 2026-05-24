import api from './axiosConfig'

export const ProductApi = {
  getAll: async () => {
    const response = await api.get('/products')
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/products', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },
  delete: async (id) => {
    await api.delete(`/products/${id}`)
  },
  search: async (name) => {
    const response = await api.get(`/products/search?name=${name}`)
    return response.data
  },
  filterByCategory: async (category) => {
    const response = await api.get(`/products/filter?category=${category}`)
    return response.data
  },
   getPage: async (page, size) => {
    const response = await api.get(`/products/page?page=${page}&size=${size}`)
    return response.data
  },
}