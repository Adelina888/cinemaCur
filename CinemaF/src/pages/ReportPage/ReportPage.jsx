import React, { useState } from 'react'
import { ReportApi } from '../../services/ReportApi'
import './ReportPage.css'

export const ReportPage = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [salesData, setSalesData] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)

  const [topLimit, setTopLimit] = useState(10)
  const [topProducts, setTopProducts] = useState([])
  const [topMerchandise, setTopMerchandise] = useState([])
  const [loadingTop, setLoadingTop] = useState(false)

  const [activeTab, setActiveTab] = useState('sales')

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
    if (!startDate || !endDate) { alert('Выберите начальную и конечную дату'); return }
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
    if (!startDate || !endDate) { alert('Выберите начальную и конечную дату'); return }
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString()

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount)

  const getPaymentMethodLabel = (method) => {
    const methods = { 'CASH': 'Наличные', 'CARD': 'Карта', 'ONLINE': 'Онлайн' }
    return methods[method] || method || '-'
  }

  return (
    <div className="report-page">
      <h1 className="report-page__header">Отчёты и аналитика</h1>

      <div className="report-page__tabs">
        <button
          onClick={() => setActiveTab('sales')}
          className={`report-page__tab ${activeTab === 'sales' ? 'report-page__tab--active' : ''}`}
        >
          Отчёт по продажам
        </button>
        <button
          onClick={() => { setActiveTab('topProducts'); loadTopProducts() }}
          className={`report-page__tab ${activeTab === 'topProducts' ? 'report-page__tab--active' : ''}`}
        >
          Топ товаров бара
        </button>
        <button
          onClick={() => { setActiveTab('topMerchandise'); loadTopProducts() }}
          className={`report-page__tab ${activeTab === 'topMerchandise' ? 'report-page__tab--active' : ''}`}
        >
          Топ мерча
        </button>
      </div>

      {activeTab === 'sales' && (
        <div className="report-page__card">
          <h3 className="report-page__card-title">Отчёт по продажам</h3>

          <div className="report-page__filter-row" style={{ marginBottom: 20 }}>
            <div>
              <label className="report-page__label">С даты:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="report-page__input"
                style={{ marginLeft: 8 }}
              />
            </div>
            <div>
              <label className="report-page__label">По дату:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="report-page__input"
                style={{ marginLeft: 8 }}
              />
            </div>
            <button onClick={loadSalesData} disabled={loadingSales} className="report-page__btn">
              {loadingSales ? 'Загрузка...' : 'Показать'}
            </button>
            <button onClick={exportSalesToExcel} disabled={!startDate || !endDate} className="report-page__btn-secondary">
              Экспорт Excel
            </button>
            <button onClick={exportSalesToPdf} disabled={!startDate || !endDate} className="report-page__btn-secondary">
              Экспорт PDF
            </button>
          </div>

          {salesData.length === 0 ? (
            <div className="report-page__empty">
              Нет данных. Выберите период и нажмите "Показать".
            </div>
          ) : (
            <>
              <div className="report-page__summary">
                <strong>Всего продаж:</strong> {salesData.length} |{' '}
                <strong style={{ marginLeft: 20 }}>Общая выручка:</strong> {formatCurrency(salesData.reduce((sum, s) => sum + s.totalAmount, 0))}
              </div>
              <table className="report-page__table">
                <thead>
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
                      <td className="report-page__table-cell">{sale.receiptId}</td>
                      <td className="report-page__table-cell">{formatDate(sale.date)}</td>
                      <td className="report-page__table-cell">{getPaymentMethodLabel(sale.paymentMethod)}</td>
                      <td className="report-page__table-cell">{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {activeTab === 'topProducts' && (
        <div className="report-page__card">
          <h3 className="report-page__card-title">Топ товаров бара</h3>

          <div className="report-page__filter-row" style={{ marginBottom: 20 }}>
            <div>
              <label className="report-page__label">Количество в топе:</label>
              <input
                type="number"
                value={topLimit}
                onChange={(e) => setTopLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 10)))}
                min="1"
                max="100"
                className="report-page__input report-page__w-70"
                style={{ marginLeft: 8 }}
              />
            </div>
            <button onClick={loadTopProducts} disabled={loadingTop} className="report-page__btn">
              {loadingTop ? 'Загрузка...' : 'Показать'}
            </button>
            <button onClick={exportTopProductsToExcel} className="report-page__btn-secondary">
              Экспорт Excel
            </button>
            <button onClick={exportTopProductsToPdf} className="report-page__btn-secondary">
              Экспорт PDF
            </button>
          </div>

          {loadingTop ? (
            <div className="report-page__empty">Загрузка...</div>
          ) : topProducts.length === 0 ? (
            <div className="report-page__empty">Нет данных. Нажмите "Показать".</div>
          ) : (
            <table className="report-page__table">
              <thead>
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
                    <td className="report-page__table-cell">{index + 1}</td>
                    <td className="report-page__table-cell">{product.productId}</td>
                    <td className="report-page__table-cell">{product.productName}</td>
                    <td className="report-page__table-cell" style={{ fontWeight: 600 }}>{product.totalQuantity} шт</td>
                    <td className="report-page__table-cell">{formatCurrency(product.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'topMerchandise' && (
        <div className="report-page__card">
          <h3 className="report-page__card-title">Топ мерчендайза</h3>

          <div className="report-page__filter-row" style={{ marginBottom: 20 }}>
            <div>
              <label className="report-page__label">Количество в топе:</label>
              <input
                type="number"
                value={topLimit}
                onChange={(e) => setTopLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 10)))}
                min="1"
                max="100"
                className="report-page__input report-page__w-70"
                style={{ marginLeft: 8 }}
              />
            </div>
            <button onClick={loadTopProducts} disabled={loadingTop} className="report-page__btn">
              {loadingTop ? 'Загрузка...' : 'Показать'}
            </button>
            <button onClick={exportTopMerchandiseToExcel} className="report-page__btn-secondary">
              Экспорт Excel
            </button>
            <button onClick={exportTopMerchandiseToPdf} className="report-page__btn-secondary">
              Экспорт PDF
            </button>
          </div>

          {loadingTop ? (
            <div className="report-page__empty">Загрузка...</div>
          ) : topMerchandise.length === 0 ? (
            <div className="report-page__empty">Нет данных. Нажмите "Показать".</div>
          ) : (
            <table className="report-page__table">
              <thead>
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
                    <td className="report-page__table-cell">{index + 1}</td>
                    <td className="report-page__table-cell">{item.merchandiseId}</td>
                    <td className="report-page__table-cell">{item.merchandiseName}</td>
                    <td className="report-page__table-cell" style={{ fontWeight: 600 }}>{item.totalQuantity} шт</td>
                    <td className="report-page__table-cell">{formatCurrency(item.totalRevenue)}</td>
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