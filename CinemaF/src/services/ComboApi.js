import api from './axiosConfig'

export const ComboApi = {
  getAll: async () => {
    const response = await api.get('/combos')
    return response.data
  },

  getPage: async (page, size) => {
    const response = await api.get(`/combos/page?page=${page}&size=${size}`)
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/combos/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/combos', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/combos/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/combos/${id}`)
  },
  hardDelete: async (id) => {
  await api.delete(`/combos/${id}/hard`)
},

  search: async (name) => {
    const response = await api.get(`/combos/search?name=${name}`)
    return response.data
  },

  filterByActive: async (isActive) => {
    const response = await api.get(`/combos/filter?isActive=${isActive}`)
    return response.data
  },
}