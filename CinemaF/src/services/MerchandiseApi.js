import api from './axiosConfig'

export const MerchandiseApi = {
  // Получение всех товаров
  getAll: async () => {
    const response = await api.get('/merchandise')
    return response.data
  },

  // Получение с пагинацией
  getPage: async (page, size) => {
    const response = await api.get(`/merchandise/page?page=${page}&size=${size}`)
    return response.data
  },

  // Получение по ID
  getById: async (id) => {
    const response = await api.get(`/merchandise/${id}`)
    return response.data
  },

  // Создание
  create: async (data) => {
    const response = await api.post('/merchandise', data)
    return response.data
  },

  // Обновление
  update: async (id, data) => {
    const response = await api.put(`/merchandise/${id}`, data)
    return response.data
  },

  // Удаление
  delete: async (id) => {
    await api.delete(`/merchandise/${id}`)
  },
   hardDelete: async (id) => {
    await api.delete(`/merchandise/${id}/hard`)
  },

  // Поиск по имени
  search: async (name) => {
    const response = await api.get(`/merchandise/search?name=${name}`)
    return response.data
  },

  // Фильтр по типу
  filterByType: async (type) => {
    const response = await api.get(`/merchandise/filter?type=${type}`)
    return response.data
  },

  // Фильтр по размеру
  filterBySize: async (size) => {
    const response = await api.get(`/merchandise/filter?size=${size}`)
    return response.data
  },

  // Фильтр по статусу
  filterByStatus: async (status) => {
    const response = await api.get(`/merchandise/filter?status=${status}`)
    return response.data
  },
}