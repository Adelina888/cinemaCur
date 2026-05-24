import api from './axiosConfig'

export const RemainsApi = {
  // Получение остатков по товару
  getByProductId: async (productId) => {
    const response = await api.get(`/remains/${productId}`)
    return response.data
  },

  // Ручная корректировка остатка в баре
  adjustBarStock: async (productId, qty) => {
    await api.put(`/remains/${productId}/bar?qty=${qty}`)
  },

  // Ручная корректировка остатка на складе
  adjustWarehouseStock: async (productId, qty) => {
    await api.put(`/remains/${productId}/warehouse?qty=${qty}`)
  },

  // Перемещение со склада в бар
  transferToBar: async (productId, qty) => {
    await api.post(`/remains/${productId}/transfer?qty=${qty}`)
  },

  // Проверка низких остатков
  checkLowStock: async (threshold = 5) => {
    const response = await api.get(`/remains/low-stock?threshold=${threshold}`)
    return response.data
  },

  // История движений по товару
  getMovements: async (productId, page = 0, size = 20) => {
    const response = await api.get(`/remains/${productId}/movements?page=${page}&size=${size}`)
    return response.data
  },
}