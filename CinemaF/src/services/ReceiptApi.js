import api from './axiosConfig'

export const ReceiptApi = {
  createDraft: async () => {
    const response = await api.post('/receipts/draft')
    return response.data
  },

  addMerchandise: async (receiptId, merchandiseId, quantity) => {
    await api.post(`/receipts/${receiptId}/merchandise?merchandiseId=${merchandiseId}&quantity=${quantity}`)
  },

  addCombo: async (receiptId, comboId, quantity) => {
    await api.post(`/receipts/${receiptId}/combo?comboId=${comboId}&quantity=${quantity}`)
  },

  removeMerchandise: async (receiptId, merchandiseItemId) => {
    await api.delete(`/receipts/${receiptId}/merchandise/${merchandiseItemId}`)
  },

  removeCombo: async (receiptId, comboItemId) => {
    await api.delete(`/receipts/${receiptId}/combo/${comboItemId}`)
  },

  updateMerchandiseQuantity: async (receiptId, merchandiseItemId, quantity) => {
    await api.put(`/receipts/${receiptId}/merchandise/${merchandiseItemId}?quantity=${quantity}`)
  },

  updateComboQuantity: async (receiptId, comboItemId, quantity) => {
    await api.put(`/receipts/${receiptId}/combo/${comboItemId}?quantity=${quantity}`)
  },

  sell: async (receiptId, paymentMethod) => {
    const response = await api.post(`/receipts/${receiptId}/sell?paymentMethod=${paymentMethod}`)
    return response.data
  },

  cancel: async (receiptId) => {
    const response = await api.post(`/receipts/${receiptId}/cancel`)
    return response.data
  },

  getAll: async (page = 0, size = 10) => {
    const response = await api.get(`/receipts?page=${page}&size=${size}`)
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/receipts/${id}`)
    return response.data
  },

  getByDateRange: async (start, end, page = 0, size = 10) => {
    const response = await api.get(`/receipts/report?start=${start}&end=${end}&page=${page}&size=${size}`)
    return response.data
  },
}