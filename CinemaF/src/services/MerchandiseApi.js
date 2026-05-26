import api from './axiosConfig'

export const MerchandiseApi = {
  getAll: async () => {
    const response = await api.get('/merchandise')
    return response.data
  },

  getPage: async (page, size) => {
    const response = await api.get(`/merchandise/page?page=${page}&size=${size}`)
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/merchandise/${id}`)
    return response.data
  },


  create: async (data) => {
    const response = await api.post('/merchandise', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/merchandise/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/merchandise/${id}`)
  },
   hardDelete: async (id) => {
    await api.delete(`/merchandise/${id}/hard`)
  },

  search: async (name) => {
    const response = await api.get(`/merchandise/search?name=${name}`)
    return response.data
  },

  filterByType: async (type) => {
    const response = await api.get(`/merchandise/filter?type=${type}`)
    return response.data
  },

  filterBySize: async (size) => {
    const response = await api.get(`/merchandise/filter?size=${size}`)
    return response.data
  },

  filterByStatus: async (status) => {
    const response = await api.get(`/merchandise/filter?status=${status}`)
    return response.data
  },
}