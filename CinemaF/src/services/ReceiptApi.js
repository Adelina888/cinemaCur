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

  // Оформление продажи
  sell: async (receiptId, paymentMethod) => {
    const response = await api.post(`/receipts/${receiptId}/sell?paymentMethod=${paymentMethod}`)
    return response.data
  },

  // Оформление возврата (создаёт новый чек)
cancel: async (receiptId) => {
  const response = await api.post(`/receipts/${receiptId}/cancel`)
  return response.data
},

  // Получение всех чеков
  getAll: async () => {
    const response = await api.get('/receipts')
    return response.data
  },

  // Получение чека по ID
  getById: async (id) => {
    const response = await api.get(`/receipts/${id}`)
    return response.data
  },

  // Получение чеков по диапазону дат
  getByDateRange: async (start, end) => {
    const response = await api.get(`/receipts/report?start=${start}&end=${end}`)
    return response.data
  },
}