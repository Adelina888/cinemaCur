import api from './axiosConfig'

export const RemainsApi = {
  getByProductId: async (productId) => {
    const response = await api.get(`/remains/${productId}`)
    return response.data
  },

  adjustBarStock: async (productId, qty) => {
    await api.put(`/remains/${productId}/bar?qty=${qty}`)
  },

  adjustWarehouseStock: async (productId, qty) => {
    await api.put(`/remains/${productId}/warehouse?qty=${qty}`)
  },

  transferToBar: async (productId, qty) => {
    await api.post(`/remains/${productId}/transfer?qty=${qty}`)
  },

  checkLowStock: async (threshold = 5) => {
    const response = await api.get(`/remains/low-stock?threshold=${threshold}`)
    return response.data
  },

  getMovements: async (productId, page = 0, size = 20) => {
    const response = await api.get(`/remains/${productId}/movements?page=${page}&size=${size}`)
    return response.data
  },
}