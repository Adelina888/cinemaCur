import React, { useEffect, useState } from 'react'
import { ReceiptApi } from '../../services/ReceiptApi'
import { MerchandiseApi } from '../../services/MerchandiseApi'
import { ComboApi } from '../../services/ComboApi'
import './ReceiptPage.css'

export const ReceiptPage = () => {
  const [receipts, setReceipts] = useState([])
  const [currentReceipt, setCurrentReceipt] = useState(null)
  const [merchandiseList, setMerchandiseList] = useState([])
  const [comboList, setComboList] = useState([])
  const [loading, setLoading] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  const [selectedMerchandiseId, setSelectedMerchandiseId] = useState('')
  const [selectedMerchandiseQuantity, setSelectedMerchandiseQuantity] = useState(1)
  const [selectedComboId, setSelectedComboId] = useState('')
  const [selectedComboQuantity, setSelectedComboQuantity] = useState(1)

  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [sellingReceiptId, setSellingReceiptId] = useState(null)
  const [cancellingReceiptId, setCancellingReceiptId] = useState(null)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)

  const [editingItem, setEditingItem] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')

  const [returnedReceiptIds, setReturnedReceiptIds] = useState([])

  const MAX_QUANTITY = 999

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
      let data
      if (isFiltered && startDate && endDate) {
        const formattedStart = `${startDate}T00:00:00`
        const formattedEnd = `${endDate}T23:59:59`
        data = await ReceiptApi.getByDateRange(formattedStart, formattedEnd, page, pageSize)
      } else {
        data = await ReceiptApi.getAll(page, pageSize)
      }
      setReceipts(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)

      const returned = (data.content || [])
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

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert('Выберите обе даты')
      return
    }
    setIsFiltered(true)
    setPage(0)
    setTimeout(() => loadReceipts(), 0)
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsFiltered(false)
    setPage(0)
    setTimeout(() => loadReceipts(), 0)
  }

  const handleCreateReceipt = async () => {
    setLoading(true)
    try {
      const receipt = await ReceiptApi.createDraft()
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
      const allReceipts = await ReceiptApi.getAll(0, 100)
      const draft = allReceipts.content?.find(r => r.typeOfOperation === 'DRAFT' || !r.typeOfOperation)
      if (draft) {
        const fullReceipt = await ReceiptApi.getById(draft.id)
        setCurrentReceipt(fullReceipt)
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

  const handleRemoveMerchandise = async (item) => {
    if (!window.confirm('Удалить этот товар из чека?')) return
    if (!item || !item.id) {
      alert('Ошибка: не удалось определить ID позиции')
      return
    }
    try {
      await ReceiptApi.removeMerchandise(currentReceipt.id, item.id)
      const updated = await ReceiptApi.getById(currentReceipt.id)
      setCurrentReceipt(updated)
      await loadReceipts()
    } catch (error) {
      console.error('Ошибка удаления', error)
      alert('Ошибка удаления: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleRemoveCombo = async (item) => {
    if (!window.confirm('Удалить это комбо из чека?')) return
    if (!item || !item.id) {
      alert('Ошибка: не удалось определить ID позиции')
      return
    }
    try {
      await ReceiptApi.removeCombo(currentReceipt.id, item.id)
      const updated = await ReceiptApi.getById(currentReceipt.id)
      setCurrentReceipt(updated)
      await loadReceipts()
    } catch (error) {
      console.error('Ошибка удаления', error)
      alert('Ошибка удаления: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const startEditQuantity = (item, type, currentQuantity) => {
    if (!item || !item.id) {
      alert('Ошибка: не удалось определить ID позиции')
      return
    }
    setEditingItem({ id: item.id, type, currentQuantity })
    setEditQuantity(currentQuantity)
  }

  const saveQuantity = async () => {
    if (!editingItem) return
    const newQuantity = parseInt(editQuantity)
    if (isNaN(newQuantity) || newQuantity < 1 || newQuantity > MAX_QUANTITY) {
      alert(`Количество должно быть от 1 до ${MAX_QUANTITY}`)
      return
    }
    try {
      if (editingItem.type === 'merchandise') {
        await ReceiptApi.updateMerchandiseQuantity(currentReceipt.id, editingItem.id, newQuantity)
      } else {
        await ReceiptApi.updateComboQuantity(currentReceipt.id, editingItem.id, newQuantity)
      }
      const updated = await ReceiptApi.getById(currentReceipt.id)
      setCurrentReceipt(updated)
      setEditingItem(null)
      setEditQuantity('')
      await loadReceipts()
    } catch (error) {
      console.error('Ошибка обновления количества', error)
      alert('Ошибка обновления: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditQuantity('')
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
      alert(`Продажа оформлена! Чек №${sold.id}, сумма: ${sold.totalAmount} руб.`)
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
    if (!window.confirm(`Вернуть чек №${receiptId}?`)) return

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

  const getStatusLabel = (type) => {
    const statuses = { 'DRAFT': 'Черновик', 'SALE': 'Продано', 'RETURN': 'Возврат' }
    if (!type) return 'Черновик'
    return statuses[type] || type
  }

  const getStatusBadgeClass = (type) => {
    if (!type || type === 'DRAFT') return 'receipt-page__badge--draft'
    if (type === 'SALE') return 'receipt-page__badge--sale'
    if (type === 'RETURN') return 'receipt-page__badge--return'
    return ''
  }

  const getPaymentMethodLabel = (method) => {
    const methods = { 'CASH': 'Наличные', 'CARD': 'Карта', 'ONLINE': 'Онлайн' }
    return methods[method] || method || '-'
  }

  useEffect(() => {
    loadMerchandise()
    loadCombos()
    loadReceipts()
  }, [page, isFiltered])

  if (loading && receipts.length === 0) {
    return (
      <div className="receipt-page">
        <div className="receipt-page__loading">
          <div className="receipt-page__spinner" />
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="receipt-page">
      <h1 className="receipt-page__header">Продажи</h1>

      <div className="receipt-page__card">
        <div className="receipt-page__filter-row">
          <button onClick={handleCreateReceipt} disabled={loading} className="receipt-page__btn">
            Новый чек
          </button>
          <button onClick={loadDraftReceipt} disabled={loading} className="receipt-page__btn-secondary">
            Загрузить черновик
          </button>
        </div>
      </div>

      {currentReceipt && (!currentReceipt.typeOfOperation || currentReceipt.typeOfOperation === 'DRAFT') && (
        <div className="receipt-page__card receipt-page__card--draft">
          <h3 className="receipt-page__card-title">
            Текущий чек №{currentReceipt.id}
            <span style={{ fontSize: 14, marginLeft: 10, color: '#64748b', fontWeight: 400 }}>
              (товаров: {currentReceipt.merchandiseItems.length + currentReceipt.comboItems.length})
            </span>
          </h3>

          <div className="receipt-page__form-row">
            <div className="receipt-page__card" style={{ flex: 1 }}>
              <h4 className="receipt-page__section-title">Добавить мерч</h4>
              <div className="receipt-page__filter-row">
                <select
                  value={selectedMerchandiseId}
                  onChange={(e) => setSelectedMerchandiseId(e.target.value)}
                  className="receipt-page__select receipt-page__w-200"
                >
                  <option value="">Выберите товар</option>
                  {merchandiseList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.price} руб.)</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Кол-во"
                  value={selectedMerchandiseQuantity}
                  onChange={(e) => setSelectedMerchandiseQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={MAX_QUANTITY}
                  className="receipt-page__input receipt-page__w-100"
                />
                <button onClick={handleAddMerchandise} className="receipt-page__btn-secondary">Добавить</button>
              </div>
            </div>

            <div className="receipt-page__card" style={{ flex: 1 }}>
              <h4 className="receipt-page__section-title">Добавить комбо</h4>
              <div className="receipt-page__filter-row">
                <select
                  value={selectedComboId}
                  onChange={(e) => setSelectedComboId(e.target.value)}
                  className="receipt-page__select receipt-page__w-200"
                >
                  <option value="">Выберите комбо</option>
                  {comboList.filter(c => c.isActive).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.comboPrice} руб.)</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Кол-во"
                  value={selectedComboQuantity}
                  onChange={(e) => setSelectedComboQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={MAX_QUANTITY}
                  className="receipt-page__input receipt-page__w-100"
                />
                <button onClick={handleAddCombo} className="receipt-page__btn-secondary">Добавить</button>
              </div>
            </div>
          </div>

          <h4 className="receipt-page__section-title">Позиции в чеке:</h4>
          {currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0 ? (
            <div className="receipt-page__empty">Чек пуст. Добавьте товары выше.</div>
          ) : (
            <table className="receipt-page__table">
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentReceipt.merchandiseItems.map((item, idx) => (
                  <tr key={`merch-${idx}`}>
                    <td className="receipt-page__table-cell">Мерч</td>
                    <td className="receipt-page__table-cell">{item.merchandiseName}</td>
                    <td className="receipt-page__table-cell">{item.price} руб.</td>
                    <td className="receipt-page__table-cell">
                      {editingItem?.id === item.id && editingItem?.type === 'merchandise' ? (
                        <div className="receipt-page__filter-row">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            min="1"
                            max={MAX_QUANTITY}
                            className="receipt-page__input"
                            style={{ width: 70 }}
                          />
                          <button onClick={saveQuantity} className="receipt-page__btn-success">✓</button>
                          <button onClick={cancelEdit} className="receipt-page__btn-secondary">✕</button>
                        </div>
                      ) : (
                        <span>{item.quantity}</span>
                      )}
                    </td>
                    <td className="receipt-page__table-cell">{item.subtotal} руб.</td>
                    <td className="receipt-page__table-cell">
                      {!editingItem && (
                        <div className="receipt-page__btn-group">
                          <button onClick={() => startEditQuantity(item, 'merchandise', item.quantity)} className="receipt-page__btn-secondary">✎</button>
                          <button onClick={() => handleRemoveMerchandise(item)} className="receipt-page__btn-danger">✖</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {currentReceipt.comboItems.map((item, idx) => (
                  <tr key={`combo-${idx}`}>
                    <td className="receipt-page__table-cell">Комбо</td>
                    <td className="receipt-page__table-cell">{item.comboName}</td>
                    <td className="receipt-page__table-cell">{item.price} руб.</td>
                    <td className="receipt-page__table-cell">
                      {editingItem?.id === item.id && editingItem?.type === 'combo' ? (
                        <div className="receipt-page__filter-row">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            min="1"
                            max={MAX_QUANTITY}
                            className="receipt-page__input"
                            style={{ width: 70 }}
                          />
                          <button onClick={saveQuantity} className="receipt-page__btn-success">✓</button>
                          <button onClick={cancelEdit} className="receipt-page__btn-secondary">✕</button>
                        </div>
                      ) : (
                        <span>{item.quantity}</span>
                      )}
                    </td>
                    <td className="receipt-page__table-cell">{item.subtotal} руб.</td>
                    <td className="receipt-page__table-cell">
                      {!editingItem && (
                        <div className="receipt-page__btn-group">
                          <button onClick={() => startEditQuantity(item, 'combo', item.quantity)} className="receipt-page__btn-secondary">✎</button>
                          <button onClick={() => handleRemoveCombo(item)} className="receipt-page__btn-danger">✖</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="receipt-page__totals">
                  <td colSpan="4" align="right">ИТОГО:</td>
                  <td colSpan="2">{currentReceipt.totalAmount} руб.</td>
                </tr>
              </tbody>
            </table>
          )}

          <div className="receipt-page__filter-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="receipt-page__select"
            >
              <option value="CASH">Наличные</option>
              <option value="CARD">Карта</option>
              <option value="ONLINE">Онлайн</option>
            </select>
            <button 
              onClick={handleSell} 
              disabled={loading || sellingReceiptId === currentReceipt.id || (currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0)}
              className="receipt-page__btn-success"
            >
              {sellingReceiptId === currentReceipt.id ? 'Оформление...' : 'Оформить продажу'}
            </button>
            <button onClick={() => setCurrentReceipt(null)} className="receipt-page__btn-secondary">Отмена</button>
          </div>
        </div>
      )}

      <div className="receipt-page__card">
        <h3 className="receipt-page__card-title">История чеков</h3>

        <div className="receipt-page__filter-row" style={{ marginBottom: 16 }}>
          <span>Фильтр по дате:</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="receipt-page__input" />
          <span>до</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="receipt-page__input" />
          <button onClick={applyDateFilter} className="receipt-page__btn-secondary">Применить</button>
          <button onClick={clearDateFilter} className="receipt-page__btn-secondary">Сбросить</button>
        </div>

        {receipts.length === 0 ? (
          <div className="receipt-page__empty">Нет чеков</div>
        ) : (
          <>
            <table className="receipt-page__table">
              <thead>
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
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td className="receipt-page__table-cell">{receipt.id}</td>
                    <td className="receipt-page__table-cell">{new Date(receipt.date).toLocaleString()}</td>
                    <td className="receipt-page__table-cell">{receipt.totalAmount} руб.</td>
                    <td className="receipt-page__table-cell">{getPaymentMethodLabel(receipt.paymentMethod)}</td>
                    <td className="receipt-page__table-cell">
                      <span className={`receipt-page__badge ${getStatusBadgeClass(receipt.typeOfOperation)}`}>
                        {getStatusLabel(receipt.typeOfOperation)}
                      </span>
                    </td>
                    <td className="receipt-page__table-cell">
                      <div className="receipt-page__btn-group">
                        <button onClick={() => handleViewReceipt(receipt)} className="receipt-page__btn-secondary">Просмотр</button>
                        {receipt.typeOfOperation === 'SALE' && !returnedReceiptIds.includes(receipt.id) && (
                          <button
                            onClick={() => handleCancelReceipt(receipt.id)}
                            disabled={cancellingReceiptId === receipt.id}
                            className="receipt-page__btn-warning"
                          >
                            {cancellingReceiptId === receipt.id ? 'Отмена...' : 'Вернуть'}
                          </button>
                        )}
                        {receipt.typeOfOperation === 'SALE' && returnedReceiptIds.includes(receipt.id) && (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Возврат оформлен</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="receipt-page__pagination">
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))} 
                  disabled={page === 0}
                  className="receipt-page__btn-secondary"
                >
                  Назад
                </button>
                <span className="receipt-page__pagination-info">
                  Страница <strong>{page + 1}</strong> из {totalPages} 
                  <span style={{ color: '#94a3b8', marginLeft: 4 }}>(всего {totalElements} чеков)</span>
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                  disabled={page >= totalPages - 1}
                  className="receipt-page__btn-secondary"
                >
                  Вперёд
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showReceiptModal && currentReceipt && (
        <div className="receipt-page__modal-overlay">
          <div className="receipt-page__modal">
            <h2>Чек №{currentReceipt.id}</h2>
            <p><strong>Дата:</strong> {new Date(currentReceipt.date).toLocaleString()}</p>
            <p><strong>Статус:</strong> {getStatusLabel(currentReceipt.typeOfOperation)}</p>
            <p><strong>Способ оплаты:</strong> {getPaymentMethodLabel(currentReceipt.paymentMethod)}</p>

            <h4 className="receipt-page__section-title">Товары:</h4>
            {currentReceipt.merchandiseItems.length === 0 && currentReceipt.comboItems.length === 0 ? (
              <div className="receipt-page__empty">Нет товаров</div>
            ) : (
              <table className="receipt-page__table">
                <thead>
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
                    <tr key={`merch-modal-${idx}`}>
                      <td className="receipt-page__table-cell">Мерч</td>
                      <td className="receipt-page__table-cell">{item.merchandiseName}</td>
                      <td className="receipt-page__table-cell">{item.price} руб.</td>
                      <td className="receipt-page__table-cell">{item.quantity}</td>
                      <td className="receipt-page__table-cell">{item.subtotal} руб.</td>
                    </tr>
                  ))}
                  {currentReceipt.comboItems.map((item, idx) => (
                    <tr key={`combo-modal-${idx}`}>
                      <td className="receipt-page__table-cell">Комбо</td>
                      <td className="receipt-page__table-cell">{item.comboName}</td>
                      <td className="receipt-page__table-cell">{item.price} руб.</td>
                      <td className="receipt-page__table-cell">{item.quantity}</td>
                      <td className="receipt-page__table-cell">{item.subtotal} руб.</td>
                    </tr>
                  ))}
                  <tr className="receipt-page__totals">
                    <td colSpan="4" align="right">ИТОГО:</td>
                    <td colSpan="2">{currentReceipt.totalAmount} руб.</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} className="receipt-page__btn-secondary">Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}