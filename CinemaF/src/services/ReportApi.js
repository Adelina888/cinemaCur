import api from './axiosConfig'

export const ReportApi = {
  getTopProducts: async (limit = 10) => {
    const response = await api.get(`/reports/top-products?limit=${limit}`)
    return response.data
  },

  getTopMerchandise: async (limit = 10) => {
    const response = await api.get(`/reports/top-merchandise?limit=${limit}`)
    return response.data
  },

  getSalesData: async (startDate, endDate) => {
    const response = await api.get(`/reports/sales-data?start=${startDate}&end=${endDate}`)
    return response.data
  },

  getSalesPage: async (startDate, endDate, page = 0, size = 10) => {
    const response = await api.get(`/reports/sales/page?start=${startDate}&end=${endDate}&page=${page}&size=${size}`)
    return response.data
  },

  exportSalesToExcel: async (startDate, endDate) => {
    const response = await api.get(`/reports/sales/excel?start=${startDate}&end=${endDate}`, {
      responseType: 'blob'
    })
    return response.data
  },

  exportTopProductsToExcel: async (limit = 10) => {
    const response = await api.get(`/reports/top-products/excel?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },

  exportTopMerchandiseToExcel: async (limit = 10) => {
    const response = await api.get(`/reports/top-merchandise/excel?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },

  exportSalesToPdf: async (startDate, endDate) => {
    const response = await api.get(`/reports/sales/pdf?start=${startDate}&end=${endDate}`, {
      responseType: 'blob'
    })
    return response.data
  },

  exportTopProductsToPdf: async (limit = 10) => {
    const response = await api.get(`/reports/top-products/pdf?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },

  exportTopMerchandiseToPdf: async (limit = 10) => {
    const response = await api.get(`/reports/top-merchandise/pdf?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },
}