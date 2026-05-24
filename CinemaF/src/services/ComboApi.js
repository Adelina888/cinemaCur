import api from './axiosConfig'

export const ComboApi = {
  // Получение всех комбо
  getAll: async () => {
    const response = await api.get('/combos')
    return response.data
  },

  // Получение с пагинацией
  getPage: async (page, size) => {
    const response = await api.get(`/combos/page?page=${page}&size=${size}`)
    return response.data
  },

  // Получение по ID
  getById: async (id) => {
    const response = await api.get(`/combos/${id}`)
    return response.data
  },

  // Создание
  create: async (data) => {
    const response = await api.post('/combos', data)
    return response.data
  },

  // Обновление
  update: async (id, data) => {
    const response = await api.put(`/combos/${id}`, data)
    return response.data
  },

  // Удаление
  delete: async (id) => {
    await api.delete(`/combos/${id}`)
  },

  // Поиск по названию
  search: async (name) => {
    const response = await api.get(`/combos/search?name=${name}`)
    return response.data
  },

  // Фильтр по активности
  filterByActive: async (isActive) => {
    const response = await api.get(`/combos/filter?isActive=${isActive}`)
    return response.data
  },
}