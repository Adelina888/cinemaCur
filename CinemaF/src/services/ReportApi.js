import api from './axiosConfig'

export const ReportApi = {
  // Получение топа товаров бара
  getTopProducts: async (limit = 10) => {
    const response = await api.get(`/reports/top-products?limit=${limit}`)
    return response.data
  },

  // Получение топа мерча
  getTopMerchandise: async (limit = 10) => {
    const response = await api.get(`/reports/top-merchandise?limit=${limit}`)
    return response.data
  },

  // Получение данных по продажам за период
  getSalesData: async (startDate, endDate) => {
    const response = await api.get(`/reports/sales-data?start=${startDate}&end=${endDate}`)
    return response.data
  },

  // Экспорт отчёта по продажам в Excel
  exportSalesToExcel: async (startDate, endDate) => {
    const response = await api.get(`/reports/sales/excel?start=${startDate}&end=${endDate}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Экспорт топа товаров в Excel
  exportTopProductsToExcel: async (limit = 10) => {
    const response = await api.get(`/reports/top-products/excel?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },
   exportTopMerchandiseToExcel: async (limit = 10) => {
    const response = await api.get(`/reports/top-merchandise/excel?limit=${limit}`, {
        responseType: 'blob'
    });
    return response.data;
    },

  // Экспорт отчёта по продажам в PDF
  exportSalesToPdf: async (startDate, endDate) => {
    const response = await api.get(`/reports/sales/pdf?start=${startDate}&end=${endDate}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Экспорт топа товаров в PDF
  exportTopProductsToPdf: async (limit = 10) => {
    const response = await api.get(`/reports/top-products/pdf?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Экспорт топа мерча в PDF
  exportTopMerchandiseToPdf: async (limit = 10) => {
    const response = await api.get(`/reports/top-merchandise/pdf?limit=${limit}`, {
      responseType: 'blob'
    })
    return response.data
  },
}