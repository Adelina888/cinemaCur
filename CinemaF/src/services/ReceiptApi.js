// src/services/ReceiptApi.js
import api from './axiosConfig'

export const ReceiptApi = {
  // Создание пустого чека
  createDraft: async () => {
    const response = await api.post('/receipts/draft')
    return response.data
  },

  // Добавление мерча в чек
  addMerchandise: async (receiptId, merchandiseId, quantity) => {
    await api.post(`/receipts/${receiptId}/merchandise?merchandiseId=${merchandiseId}&quantity=${quantity}`)
  },

  // Добавление комбо в чек
  addCombo: async (receiptId, comboId, quantity) => {
    await api.post(`/receipts/${receiptId}/combo?comboId=${comboId}&quantity=${quantity}`)
  },

  // Удаление мерча из чека
  removeMerchandise: async (receiptId, merchandiseItemId) => {
    await api.delete(`/receipts/${receiptId}/merchandise/${merchandiseItemId}`)
  },

  // Удаление комбо из чека
  removeCombo: async (receiptId, comboItemId) => {
    await api.delete(`/receipts/${receiptId}/combo/${comboItemId}`)
  },

  // Обновление количества мерча в чеке
  updateMerchandiseQuantity: async (receiptId, merchandiseItemId, quantity) => {
    await api.put(`/receipts/${receiptId}/merchandise/${merchandiseItemId}?quantity=${quantity}`)
  },

  // Обновление количества комбо в чеке
  updateComboQuantity: async (receiptId, comboItemId, quantity) => {
    await api.put(`/receipts/${receiptId}/combo/${comboItemId}?quantity=${quantity}`)
  },

  // Оформление продажи
  sell: async (receiptId, paymentMethod) => {
    const response = await api.post(`/receipts/${receiptId}/sell?paymentMethod=${paymentMethod}`)
    return response.data
  },

  // Оформление возврата
  cancel: async (receiptId) => {
    const response = await api.post(`/receipts/${receiptId}/cancel`)
    return response.data
  },

  // Получение всех чеков с пагинацией
  getAll: async (page = 0, size = 10) => {
    const response = await api.get(`/receipts?page=${page}&size=${size}`)
    return response.data
  },

  // Получение чека по ID
  getById: async (id) => {
    const response = await api.get(`/receipts/${id}`)
    return response.data
  },

  // Получение чеков по диапазону дат с пагинацией
  getByDateRange: async (start, end, page = 0, size = 10) => {
    const response = await api.get(`/receipts/report?start=${start}&end=${end}&page=${page}&size=${size}`)
    return response.data
  },
}