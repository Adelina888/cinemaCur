// src/pages/ReceiptPage.jsx
import React, { useEffect, useState } from 'react'
import { ReceiptApi } from '../services/ReceiptApi'
import { MerchandiseApi } from '../services/MerchandiseApi'
import { ComboApi } from '../services/ComboApi'

export const ReceiptPage = () => {
  // Состояния для данных
  const [receipts, setReceipts] = useState([])
  const [currentReceipt, setCurrentReceipt] = useState(null)
  const [merchandiseList, setMerchandiseList] = useState([])
  const [comboList, setComboList] = useState([])
  const [loading, setLoading] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  // Состояния для добавления товаров
  const [selectedMerchandiseId, setSelectedMerchandiseId] = useState('')
  const [selectedMerchandiseQuantity, setSelectedMerchandiseQuantity] = useState(1)
  const [selectedComboId, setSelectedComboId] = useState('')
  const [selectedComboQuantity, setSelectedComboQuantity] = useState(1)

  // Состояния для продажи
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [sellingReceiptId, setSellingReceiptId] = useState(null)
  const [cancellingReceiptId, setCancellingReceiptId] = useState(null)

  // Состояния для фильтрации истории
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredReceipts, setFilteredReceipts] = useState([])

  // Максимальные значения
  const MAX_QUANTITY = 999

  // Множество ID чеков, по которым уже сделан возврат
  const [returnedReceiptIds, setReturnedReceiptIds] = useState([])

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const loadMerchandise = async () => {
    try {
      const data = await MerchandiseApi.getAll()
      setMerchandiseList(data)
    } catch (error) {
      console.error('Ошибка загрузки мерча', error)
    }
  }

  const loadCombos = async () => {
    try {
      const data = await ComboApi.getAll()
      setComboList(data)
    } catch (error) {
      console.error('Ошибка загрузки комбо', error)
    }
  }

  const loadReceipts = async () => {
    setLoading(true)
    try {
      const data = await ReceiptApi.getAll()
      setReceipts(data)
      setFilteredReceipts(data)
      
      // Находим все чеки возврата и их оригинальные ID
      const returned = data
        .filter(r => r.typeOfOperation === 'RETURN' && r.originalReceiptId)
        .map(r => r.originalReceiptId)
      setReturnedReceiptIds(returned)
    } catch (error) {
      console.error('Ошибка загрузки чеков', error)
      alert('Ошибка загрузки чеков')
    } finally {
      setLoading(false)
    }
  }

  // ========== ФИЛЬТРАЦИЯ ПО ДАТАМ ==========
  const applyDateFilter = () => {
    if (!startDate && !endDate) {
      setFilteredReceipts(receipts)
      return
    }

    let filtered = [...receipts]
    if (startDate) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(endDate + 'T23:59:59'))
    }
    setFilteredReceipts(filtered)
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setFilteredReceipts(receipts)
  }

  // ========== РАБОТА С ЧЕКОМ ==========
  const handleCreateReceipt = async () => {
    setLoading(true)
    try {
      const receipt = await ReceiptApi.createDraft()
      console.log('Создан чек:', receipt)
      setCurrentReceipt(receipt)
      await loadReceipts()
      alert(`Чек №${receipt.id} создан`)
    } catch (error) {
      console.error('Ошибка создания чека', error)
      alert('Ошибка создания чека')
    } finally {
      setLoading(false)
    }
  }

  const loadDraftReceipt = async () => {
    setLoading(true)
    try {
      const allReceipts = await ReceiptApi.getAll()
      const draft = allReceipts.find(r => r.typeOfOperation === 'DRAFT' || !r.typeOfOperation)
      if (draft) {
        setCurrentReceipt(draft)
        alert(`Загружен черновик чека №${draft.id}`)
      } else {
        alert('Нет черновиков. Создайте новый чек.')
      }
    } catch (error) {
      console.error('Ошибка загрузки черновика', error)
      alert('Ошибка загрузки черновика')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMerchandise = async () => {
    if (!selectedMerchandiseId) {
      alert('Выберите товар')
      return
    }
    if (selectedMerchandiseQuantity <= 0 || selectedMerchandiseQuantity > MAX_QUANTITY) {
      alert(`Количество должно быть от 1 до ${MAX_QUANTITY}`)
      return
    }

    try {
      await ReceiptApi.addMerchandise(currentReceipt.id, selectedMerchandiseId, selectedMerchandiseQuantity)
      const updated = await ReceiptApi.getById(currentReceipt.id)
      setCurrentReceipt(updated)
      setSelectedMerchandiseId('')
      setSelectedMerchandiseQuantity(1)
      await loadReceipts()
    } catch (error) {
      console.error('Ошибка добавления мерча', error)
      alert('Ошибка добавления мерча: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleAddCombo = async () => {
    if (!selectedComboId) {
      alert('Выберите комбо')
      return
    }
    if (selectedComboQuantity <= 0 || selectedComboQuantity > MAX_QUANTITY) {
      alert(`Количество должно быть от 1 до ${MAX_QUANTITY}`)
      return
    }

    try {
      await ReceiptApi.addCombo(currentReceipt.id, selectedComboId, selectedComboQuantity)
      const updated = await ReceiptApi.getById(currentReceipt.id)
      setCurrentReceipt(updated)
      setSelectedComboId('')
      setSelectedComboQuantity(1)
      await loadReceipts()
    } catch (error) {
      console.error('Ошибка добавления комбо', error)
      alert('Ошибка добавления комбо: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleSell = async () => {
    if (!currentReceipt) return
    if (currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0) {
      alert('Чек пуст. Добавьте товары перед продажей')
      return
    }
    if (!paymentMethod) {
      alert('Выберите способ оплаты')
      return
    }

    setSellingReceiptId(currentReceipt.id)
    setLoading(true)

    try {
      const sold = await ReceiptApi.sell(currentReceipt.id, paymentMethod)
      setCurrentReceipt(null)
      await loadReceipts()
      alert(`Продажа оформлена! Чек №${sold.id}, сумма: ${sold.totalAmount} ₽`)
      setPaymentMethod('CASH')
    } catch (error) {
      console.error('Ошибка продажи', error)
      alert('Ошибка продажи: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    } finally {
      setSellingReceiptId(null)
      setLoading(false)
    }
  }

  const handleCancelReceipt = async (receiptId) => {
    if (!receiptId) {
      alert('Чек не найден')
      return
    }

    if (!window.confirm(`Вернуть чек №${receiptId}?`)) {
      return
    }

    setCancellingReceiptId(receiptId)
    setLoading(true)

    try {
      const cancelled = await ReceiptApi.cancel(receiptId)
      await loadReceipts()
      alert(`Возврат оформлен! Создан чек возврата №${cancelled.id}`)
    } catch (error) {
      console.error('Ошибка возврата', error)
      alert('Ошибка возврата: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    } finally {
      setCancellingReceiptId(null)
      setLoading(false)
    }
  }

  const handleViewReceipt = (receipt) => {
    setCurrentReceipt(receipt)
    setShowReceiptModal(true)
  }

  const closeModal = () => {
    setShowReceiptModal(false)
    setCurrentReceipt(null)
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const getStatusLabel = (type) => {
    const statuses = {
      'DRAFT': '📝 Черновик',
      'SALE': '✅ Продано',
      'RETURN': '🔄 Возврат'
    }
    if (!type) return '📝 Черновик'
    return statuses[type] || type
  }

  const getStatusStyle = (type) => {
    const styles = {
      'DRAFT': { color: '#856404', backgroundColor: '#fff3cd' },
      'SALE': { color: '#155724', backgroundColor: '#d4edda' },
      'RETURN': { color: '#721c24', backgroundColor: '#f8d7da' }
    }
    if (!type) return styles['DRAFT']
    return styles[type] || {}
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'CASH': '💰 Наличные',
      'CARD': '💳 Карта',
      'ONLINE': '🌐 Онлайн'
    }
    return methods[method] || method || '-'
  }

  // ========== ЗАГРУЗКА ПРИ СТАРТЕ ==========
  useEffect(() => {
    loadMerchandise()
    loadCombos()
    loadReceipts()
  }, [])

  // ========== ФИЛЬТРАЦИЯ ПРИ ИЗМЕНЕНИИ ДАТ ==========
  useEffect(() => {
    applyDateFilter()
  }, [startDate, endDate, receipts])

  return (
    <div>
      <h1>Продажи</h1>

      {/* Панель управления */}
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleCreateReceipt} disabled={loading}>
            🧾 Новый чек
          </button>
          <button onClick={loadDraftReceipt} disabled={loading}>
            📋 Загрузить черновик
          </button>
        </div>
      </div>

      {/* Текущий чек – показываем если это черновик или статус не определён */}
      {currentReceipt && (!currentReceipt.typeOfOperation || currentReceipt.typeOfOperation === 'DRAFT') && (
        <div style={{ marginBottom: 20, padding: 15, border: '2px solid #007bff', borderRadius: 5, backgroundColor: '#f0f8ff' }}>
          <h3>
            🧾 Текущий чек №{currentReceipt.id}
            <span style={{ fontSize: '14px', marginLeft: '10px', color: '#666' }}>
              (товаров: {currentReceipt.merchandiseItems.length + currentReceipt.comboItems.length})
            </span>
          </h3>

          {/* Две колонки для добавления товаров */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 15 }}>
            {/* Добавление мерча */}
            <div style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
              <h4>📦 Добавить мерч</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selectedMerchandiseId}
                  onChange={(e) => setSelectedMerchandiseId(e.target.value)}
                  style={{ padding: 8, width: 200 }}
                >
                  <option value="">Выберите товар</option>
                  {merchandiseList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.price} ₽)</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Количество"
                  value={selectedMerchandiseQuantity}
                  onChange={(e) => setSelectedMerchandiseQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={MAX_QUANTITY}
                  style={{ padding: 8, width: 100 }}
                />
                <button onClick={handleAddMerchandise}>➕ Добавить</button>
              </div>
            </div>

            {/* Добавление комбо */}
            <div style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
              <h4>🍿 Добавить комбо</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selectedComboId}
                  onChange={(e) => setSelectedComboId(e.target.value)}
                  style={{ padding: 8, width: 200 }}
                >
                  <option value="">Выберите комбо</option>
                  {comboList.filter(c => c.isActive).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.comboPrice} ₽)</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Количество"
                  value={selectedComboQuantity}
                  onChange={(e) => setSelectedComboQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={MAX_QUANTITY}
                  style={{ padding: 8, width: 100 }}
                />
                <button onClick={handleAddCombo}>➕ Добавить</button>
              </div>
            </div>
          </div>

          {/* Таблица товаров в чеке */}
          <h4>📋 Позиции в чеке:</h4>
          {currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#666', border: '1px dashed #ccc', borderRadius: 5 }}>
              Чек пуст. Добавьте товары выше.
            </div>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th>Тип</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {currentReceipt.merchandiseItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>📦 Мерч</td>
                    <td>{item.merchandiseName}</td>
                    <td>{item.price} ₽</td>
                    <td>{item.quantity}</td>
                    <td>{item.subtotal} ₽</td>
                  </tr>
                ))}
                {currentReceipt.comboItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>🍿 Комбо</td>
                    <td>{item.comboName}</td>
                    <td>{item.price} ₽</td>
                    <td>{item.quantity}</td>
                    <td>{item.subtotal} ₽</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                  <td colSpan="4" align="right">ИТОГО:</td>
                  <td>{currentReceipt.totalAmount} ₽</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Продажа */}
          <div style={{ marginTop: 15, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ padding: 8 }}
            >
              <option value="CASH">💰 Наличные</option>
              <option value="CARD">💳 Карта</option>
              <option value="ONLINE">🌐 Онлайн</option>
            </select>
            <button 
              onClick={handleSell} 
              disabled={loading || sellingReceiptId === currentReceipt.id || (currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0)}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}
            >
              {sellingReceiptId === currentReceipt.id ? 'Оформление...' : '✅ Оформить продажу'}
            </button>
          </div>
        </div>
      )}

      {/* История чеков */}
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <h3>История чеков</h3>

        {/* Фильтр по датам */}
        <div style={{ marginBottom: 15, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>Фильтр по дате:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: 5 }}
          />
          <span>до</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: 5 }}
          />
          <button onClick={clearDateFilter}>Сбросить</button>
        </div>

        {loading && receipts.length === 0 ? (
          <div>Загрузка...</div>
        ) : filteredReceipts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Нет чеков</div>
        ) : (
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f0f0f0' }}>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} style={getStatusStyle(receipt.typeOfOperation)}>
                  <td>{receipt.id}</td>
                  <td>{new Date(receipt.date).toLocaleString()}</td>
                  <td>{receipt.totalAmount} ₽</td>
                  <td>{getPaymentMethodLabel(receipt.paymentMethod)}</td>
                  <td>{getStatusLabel(receipt.typeOfOperation)}</td>
                  <td>
                    <button onClick={() => handleViewReceipt(receipt)} style={{ marginRight: 5 }}>
                      📄 Просмотр
                    </button>
                    {receipt.typeOfOperation === 'SALE' && !returnedReceiptIds.includes(receipt.id) && (
                      <button
                        onClick={() => handleCancelReceipt(receipt.id)}
                        disabled={cancellingReceiptId === receipt.id}
                      >
                        {cancellingReceiptId === receipt.id ? 'Отмена...' : '🔄 Вернуть'}
                      </button>
                    )}
                    {receipt.typeOfOperation === 'SALE' && returnedReceiptIds.includes(receipt.id) && (
                      <span style={{ color: '#999', fontSize: '12px' }}>✅ Возврат оформлен</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальное окно просмотра чека */}
      {showReceiptModal && currentReceipt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, minWidth: 500, maxWidth: '80%', maxHeight: '80%', overflow: 'auto' }}>
            <h2>Чек №{currentReceipt.id}</h2>
            <p><strong>Дата:</strong> {new Date(currentReceipt.date).toLocaleString()}</p>
            <p><strong>Статус:</strong> {getStatusLabel(currentReceipt.typeOfOperation)}</p>
            <p><strong>Способ оплаты:</strong> {getPaymentMethodLabel(currentReceipt.paymentMethod)}</p>

            <h3>Товары:</h3>
            {currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Нет товаров</div>
            ) : (
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f0f0f0' }}>
                  <tr>
                    <th>Тип</th>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Количество</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReceipt.merchandiseItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>📦 Мерч</td>
                      <td>{item.merchandiseName}</td>
                      <td>{item.price} ₽</td>
                      <td>{item.quantity}</td>
                      <td>{item.subtotal} ₽</td>
                    </tr>
                  ))}
                  {currentReceipt.comboItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>🍿 Комбо</td>
                      <td>{item.comboName}</td>
                      <td>{item.price} ₽</td>
                      <td>{item.quantity}</td>
                      <td>{item.subtotal} ₽</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                    <td colSpan="4" align="right">ИТОГО:</td>
                    <td>{currentReceipt.totalAmount} ₽</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeModal}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}