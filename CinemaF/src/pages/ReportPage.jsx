import React, { useState } from 'react'
import { ReportApi } from '../services/ReportApi'

export const ReportPage = () => {
  // Состояния для отчёта по продажам
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [salesData, setSalesData] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)

  // Состояния для топа товаров
  const [topLimit, setTopLimit] = useState(10)
  const [topProducts, setTopProducts] = useState([])
  const [topMerchandise, setTopMerchandise] = useState([])
  const [loadingTop, setLoadingTop] = useState(false)

  // Состояния для активной вкладки
  const [activeTab, setActiveTab] = useState('sales') // 'sales', 'topProducts', 'topMerchandise'

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const loadSalesData = async () => {
    if (!startDate || !endDate) {
      alert('Выберите начальную и конечную дату')
      return
    }
    setLoadingSales(true)
    try {
      const formattedStart = `${startDate}T00:00:00`
      const formattedEnd = `${endDate}T23:59:59`
      const data = await ReportApi.getSalesData(formattedStart, formattedEnd)
      setSalesData(data)
    } catch (error) {
      console.error('Ошибка загрузки данных продаж', error)
      alert('Ошибка загрузки данных продаж')
    } finally {
      setLoadingSales(false)
    }
  }

  const loadTopProducts = async () => {
    setLoadingTop(true)
    try {
      const products = await ReportApi.getTopProducts(topLimit)
      setTopProducts(products)
      const merchandise = await ReportApi.getTopMerchandise(topLimit)
      setTopMerchandise(merchandise)
    } catch (error) {
      console.error('Ошибка загрузки топа товаров', error)
      alert('Ошибка загрузки топа товаров')
    } finally {
      setLoadingTop(false)
    }
  }

  // ========== ЭКСПОРТ ==========
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const exportSalesToExcel = async () => {
    if (!startDate || !endDate) {
      alert('Выберите начальную и конечную дату')
      return
    }
    try {
      const formattedStart = `${startDate}T00:00:00`
      const formattedEnd = `${endDate}T23:59:59`
      const blob = await ReportApi.exportSalesToExcel(formattedStart, formattedEnd)
      downloadFile(blob, `sales_report_${startDate}_to_${endDate}.xlsx`)
    } catch (error) {
      console.error('Ошибка экспорта', error)
      alert('Ошибка экспорта отчёта')
    }
  }

  const exportSalesToPdf = async () => {
    if (!startDate || !endDate) {
      alert('Выберите начальную и конечную дату')
      return
    }
    try {
      const formattedStart = `${startDate}T00:00:00`
      const formattedEnd = `${endDate}T23:59:59`
      const blob = await ReportApi.exportSalesToPdf(formattedStart, formattedEnd)
      downloadFile(blob, `sales_report_${startDate}_to_${endDate}.pdf`)
    } catch (error) {
      console.error('Ошибка экспорта', error)
      alert('Ошибка экспорта отчёта')
    }
  }

  const exportTopProductsToExcel = async () => {
    try {
      const blob = await ReportApi.exportTopProductsToExcel(topLimit)
      downloadFile(blob, `top_products_${topLimit}.xlsx`)
    } catch (error) {
      console.error('Ошибка экспорта', error)
      alert('Ошибка экспорта')
    }
  }

  const exportTopProductsToPdf = async () => {
    try {
      const blob = await ReportApi.exportTopProductsToPdf(topLimit)
      downloadFile(blob, `top_products_${topLimit}.pdf`)
    } catch (error) {
      console.error('Ошибка экспорта', error)
      alert('Ошибка экспорта')
    }
  }
  const exportTopMerchandiseToExcel = async () => {
  try {
    const blob = await ReportApi.exportTopMerchandiseToExcel(topLimit)
    downloadFile(blob, `top_merchandise_${topLimit}.xlsx`)
  } catch (error) {
    console.error('Ошибка экспорта мерча в Excel', error)
    alert('Ошибка экспорта')
  }
}

  const exportTopMerchandiseToPdf = async () => {
    try {
      const blob = await ReportApi.exportTopMerchandiseToPdf(topLimit)
      downloadFile(blob, `top_merchandise_${topLimit}.pdf`)
    } catch (error) {
      console.error('Ошибка экспорта', error)
      alert('Ошибка экспорта')
    }
  }

  // ========== ФОРМАТИРОВАНИЕ ==========
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount)
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'CASH': ' Наличные',
      'CARD': ' Карта',
      'ONLINE': ' Онлайн'
    }
    return methods[method] || method || '-'
  }

  // ========== РЕНДЕР ==========
  return (
    <div>
      <h1>Отчёты и аналитика</h1>

      {/* Вкладки */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('sales')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'sales' ? '#007bff' : 'transparent',
            color: activeTab === 'sales' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px 5px 0 0'
          }}
        >
           Отчёт по продажам
        </button>
        <button
          onClick={() => { setActiveTab('topProducts'); loadTopProducts() }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'topProducts' ? '#007bff' : 'transparent',
            color: activeTab === 'topProducts' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px 5px 0 0'
          }}
        >
           Топ товаров бара
        </button>
        <button
          onClick={() => { setActiveTab('topMerchandise'); loadTopProducts() }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'topMerchandise' ? '#007bff' : 'transparent',
            color: activeTab === 'topMerchandise' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px 5px 0 0'
          }}
        >
           Топ мерча
        </button>
      </div>

      {/* Отчёт по продажам */}
      {activeTab === 'sales' && (
        <div style={{ padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
          <h3>Отчёт по продажам</h3>

          <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label>С даты:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ marginLeft: 5, padding: 5 }}
              />
            </div>
            <div>
              <label>По дату:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ marginLeft: 5, padding: 5 }}
              />
            </div>
            <button onClick={loadSalesData} disabled={loadingSales}>
              {loadingSales ? 'Загрузка...' : ' Показать'}
            </button>
            <button onClick={exportSalesToExcel} disabled={!startDate || !endDate}>
               Экспорт Excel
            </button>
            <button onClick={exportSalesToPdf} disabled={!startDate || !endDate}>
               Экспорт PDF
            </button>
          </div>

          {salesData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              Нет данных. Выберите период и нажмите "Показать".
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#e8f4f8', borderRadius: 5 }}>
                <strong>Всего продаж:</strong> {salesData.length} |{' '}
                <strong style={{ marginLeft: 20 }}>Общая выручка:</strong> {formatCurrency(salesData.reduce((sum, s) => sum + s.totalAmount, 0))}
              </div>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f0f0f0' }}>
                  <tr>
                    <th>ID чека</th>
                    <th>Дата</th>
                    <th>Способ оплаты</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale) => (
                    <tr key={sale.receiptId}>
                      <td>{sale.receiptId}</td>
                      <td>{formatDate(sale.date)}</td>
                      <td>{getPaymentMethodLabel(sale.paymentMethod)}</td>
                      <td>{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Топ товаров бара */}
      {activeTab === 'topProducts' && (
        <div style={{ padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
          <h3>Топ товаров бара</h3>

          <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label>Количество в топе:</label>
              <input
                type="number"
                value={topLimit}
                onChange={(e) => setTopLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 10)))}
                min="1"
                max="100"
                style={{ marginLeft: 5, padding: 5, width: 70 }}
              />
            </div>
            <button onClick={loadTopProducts} disabled={loadingTop}>
              {loadingTop ? 'Загрузка...' : ' Показать'}
            </button>
            <button onClick={exportTopProductsToExcel}>
               Экспорт Excel
            </button>
            <button onClick={exportTopProductsToPdf}>
               Экспорт PDF
            </button>
          </div>

          {loadingTop ? (
            <div>Загрузка...</div>
          ) : topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              Нет данных. Нажмите "Показать".
            </div>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Продано, шт</th>
                  <th>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.productId}>
                    <td>{index + 1}</td>
                    <td>{product.productId}</td>
                    <td>{product.productName}</td>
                    <td style={{ fontWeight: 'bold' }}>{product.totalQuantity} шт</td>
                    <td>{formatCurrency(product.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Топ мерча */}
      {activeTab === 'topMerchandise' && (
        <div style={{ padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
          <h3>Топ мерчендайза</h3>

          <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label>Количество в топе:</label>
              <input
                type="number"
                value={topLimit}
                onChange={(e) => setTopLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 10)))}
                min="1"
                max="100"
                style={{ marginLeft: 5, padding: 5, width: 70 }}
              />
            </div>
            <button onClick={loadTopProducts} disabled={loadingTop}>
              {loadingTop ? 'Загрузка...' : ' Показать'}
            </button>
            <button onClick={exportTopMerchandiseToExcel}>
            Экспорт Excel
            </button>
            <button onClick={exportTopMerchandiseToPdf}>
            Экспорт PDF
            </button>
          </div>

          {loadingTop ? (
            <div>Загрузка...</div>
          ) : topMerchandise.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              Нет данных. Нажмите "Показать".
            </div>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Продано, шт</th>
                  <th>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {topMerchandise.map((item, index) => (
                  <tr key={item.merchandiseId}>
                    <td>{index + 1}</td>
                    <td>{item.merchandiseId}</td>
                    <td>{item.merchandiseName}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.totalQuantity} шт</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}