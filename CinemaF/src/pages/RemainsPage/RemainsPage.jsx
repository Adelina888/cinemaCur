import React, { useEffect, useState } from 'react'
import { RemainsApi } from '../../services/RemainsApi'
import { ProductApi } from '../../services/ProductApi'
import './RemainsPage.css'

export const RemainsPage = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [remains, setRemains] = useState(null)
  const [movements, setMovements] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)

  // Пагинация для низких остатков
  const [lowStockPage, setLowStockPage] = useState(0)
  const [lowStockTotalPages, setLowStockTotalPages] = useState(0)
  const [lowStockPageSize] = useState(10)

  const [showAdjustBar, setShowAdjustBar] = useState(false)
  const [showAdjustWarehouse, setShowAdjustWarehouse] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [adjustQty, setAdjustQty] = useState('')
  const [transferQty, setTransferQty] = useState('')

  const MAX_QUANTITY = 999
  const MAX_THRESHOLD = 999

  const [movementsPage, setMovementsPage] = useState(0)
  const [movementsTotalPages, setMovementsTotalPages] = useState(0)
  const [movementsTotalElements, setMovementsTotalElements] = useState(0)
  const [pageSize] = useState(10)

  const loadProducts = async () => {
    try {
      const data = await ProductApi.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Ошибка загрузки товаров', error)
      alert('Ошибка загрузки товаров')
    }
  }

  const loadRemains = async (productId) => {
    setLoading(true)
    try {
      const data = await RemainsApi.getByProductId(productId)
      setRemains(data)
    } catch (error) {
      console.error('Ошибка загрузки остатков', error)
      setRemains({ bar: 0, warehouse: 0 })
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async (productId, page) => {
    setMovementsLoading(true)
    try {
      const data = await RemainsApi.getMovements(productId, page, pageSize)
      setMovements(data.content || [])
      setMovementsTotalPages(data.totalPages || 0)
      setMovementsTotalElements(data.totalElements || 0)
    } catch (error) {
      console.error('Ошибка загрузки истории', error)
      setMovements([])
      setMovementsTotalPages(0)
      setMovementsTotalElements(0)
    } finally {
      setMovementsLoading(false)
    }
  }

  const loadLowStock = async () => {
    try {
      const allData = await RemainsApi.checkLowStock(lowStockThreshold)
      const start = lowStockPage * lowStockPageSize
      const end = start + lowStockPageSize
      setLowStockProducts(allData.slice(start, end))
      setLowStockTotalPages(Math.ceil(allData.length / lowStockPageSize))
    } catch (error) {
      console.error('Ошибка загрузки низких остатков', error)
    }
  }

  const handleSelectProduct = async (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    setSelectedProduct(product)
    await loadRemains(productId)
    await loadMovements(productId, 0)
    setMovementsPage(0)
  }

  const handleAdjustBar = async () => {
    let qty = parseInt(adjustQty)
    if (isNaN(qty)) { alert('Введите корректное количество'); return }
    if (qty < 0) { alert('Количество не может быть отрицательным'); return }
    if (qty > MAX_QUANTITY) { alert(`Количество не может превышать ${MAX_QUANTITY}`); return }
    
    try {
      await RemainsApi.adjustBarStock(selectedProduct.id, qty)
      await loadRemains(selectedProduct.id)
      await loadMovements(selectedProduct.id, movementsPage)
      setShowAdjustBar(false)
      setAdjustQty('')
      loadLowStock()
    } catch (error) {
      alert('Ошибка корректировки: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleAdjustWarehouse = async () => {
    let qty = parseInt(adjustQty)
    if (isNaN(qty)) { alert('Введите корректное количество'); return }
    if (qty < 0) { alert('Количество не может быть отрицательным'); return }
    if (qty > MAX_QUANTITY) { alert(`Количество не может превышать ${MAX_QUANTITY}`); return }
    
    try {
      await RemainsApi.adjustWarehouseStock(selectedProduct.id, qty)
      await loadRemains(selectedProduct.id)
      await loadMovements(selectedProduct.id, movementsPage)
      setShowAdjustWarehouse(false)
      setAdjustQty('')
      loadLowStock()
    } catch (error) {
      alert('Ошибка корректировки: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleTransfer = async () => {
    let qty = parseInt(transferQty)
    if (isNaN(qty)) { alert('Введите корректное количество'); return }
    if (qty <= 0) { alert('Количество должно быть больше 0'); return }
    if (qty > MAX_QUANTITY) { alert(`Количество не может превышать ${MAX_QUANTITY}`); return }
    if (qty > (remains?.warehouse || 0)) { alert(`Недостаточно товара на складе. Доступно: ${remains?.warehouse || 0} шт`); return }
    
    try {
      await RemainsApi.transferToBar(selectedProduct.id, qty)
      await loadRemains(selectedProduct.id)
      await loadMovements(selectedProduct.id, movementsPage)
      setShowTransfer(false)
      setTransferQty('')
      loadLowStock()
    } catch (error) {
      alert('Ошибка перемещения: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleThresholdChange = (value) => {
    let newThreshold = parseInt(value)
    if (isNaN(newThreshold)) newThreshold = 5
    if (newThreshold < 0) newThreshold = 0
    if (newThreshold > MAX_THRESHOLD) { alert(`Порог не может превышать ${MAX_THRESHOLD}`); newThreshold = MAX_THRESHOLD }
    setLowStockThreshold(newThreshold)
    setLowStockPage(0)
  }

  const getMovementTypeLabel = (type) => {
    const types = {
      'ADJUST': 'Корректировка',
      'SALE': 'Продажа',
      'RETURN': 'Возврат',
      'TRANSFER': 'Перемещение',
      'INCOME': 'Поступление'
    }
    return types[type] || type
  }

  const getLocationLabel = (location) => {
    const locations = { 'WAREHOUSE': 'Склад', 'BAR': 'Бар', '': '-', null: '-' }
    return locations[location] || location || '-'
  }

  const getMovementClass = (type) => {
    const classes = {
      'ADJUST': 'remains-page__movement--adjust',
      'SALE': 'remains-page__movement--sale',
      'RETURN': 'remains-page__movement--return',
      'TRANSFER': 'remains-page__movement--transfer',
      'INCOME': 'remains-page__movement--income'
    }
    return classes[type] || ''
  }

  useEffect(() => {
    loadProducts()
    loadLowStock()
  }, [])

  useEffect(() => {
    if (selectedProduct) loadMovements(selectedProduct.id, movementsPage)
  }, [movementsPage])

  useEffect(() => {
    loadLowStock()
  }, [lowStockThreshold, lowStockPage])

  return (
    <div className="remains-page">
      <h1 className="remains-page__header">Учет остатков</h1>

      <div className="remains-page__card">
        <h3 className="remains-page__card-title">Выберите товар</h3>
        <div className="remains-page__filter-row">
          <select 
            value={selectedProduct?.id || ''} 
            onChange={(e) => handleSelectProduct(e.target.value)}
            className="remains-page__select remains-page__w-300"
          >
            <option value="">-- Выберите товар --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedProduct && (
        <div className="remains-page__card">
          <h3 className="remains-page__card-title">Остатки: {selectedProduct.name}</h3>
          {loading ? (
            <div className="remains-page__loading">
              <div className="remains-page__spinner" />
              Загрузка...
            </div>
          ) : (
            <>
              <div className="remains-page__filter-row" style={{ marginBottom: 20 }}>
                <div className="remains-page__stock-card">
                  <p className="remains-page__stock-label">Бар</p>
                  <p className="remains-page__stock-value">{remains?.bar || 0} шт</p>
                </div>
                <div className="remains-page__stock-card">
                  <p className="remains-page__stock-label">Склад</p>
                  <p className="remains-page__stock-value">{remains?.warehouse || 0} шт</p>
                </div>
                <div className="remains-page__stock-card" style={{ backgroundColor: '#f1f5f9' }}>
                  <p className="remains-page__stock-label">Всего</p>
                  <p className="remains-page__stock-value">{(remains?.bar || 0) + (remains?.warehouse || 0)} шт</p>
                </div>
              </div>

              <div className="remains-page__btn-group">
                <button onClick={() => setShowAdjustBar(true)} className="remains-page__btn-secondary">Корректировать бар</button>
                <button onClick={() => setShowAdjustWarehouse(true)} className="remains-page__btn-secondary">Корректировать склад</button>
                <button onClick={() => setShowTransfer(true)} className="remains-page__btn">Переместить со склада в бар</button>
              </div>
            </>
          )}
        </div>
      )}

      {selectedProduct && (
        <div className="remains-page__card">
          <h3 className="remains-page__card-title">История движений: {selectedProduct.name}</h3>
          {movementsLoading ? (
            <div className="remains-page__loading">
              <div className="remains-page__spinner" />
              Загрузка...
            </div>
          ) : movements.length === 0 ? (
            <div className="remains-page__empty">Нет записей о движениях</div>
          ) : (
            <>
              <table className="remains-page__table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Тип операции</th>
                    <th>Количество</th>
                    <th>Откуда</th>
                    <th>Куда</th>
                    <th>Примечание</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((move) => (
                    <tr key={move.id} className={getMovementClass(move.type)}>
                      <td className="remains-page__table-cell">{new Date(move.createdAt).toLocaleString()}</td>
                      <td className="remains-page__table-cell">{getMovementTypeLabel(move.type)}</td>
                      <td className="remains-page__table-cell">{move.quantity}</td>
                      <td className="remains-page__table-cell">{getLocationLabel(move.source)}</td>
                      <td className="remains-page__table-cell">{getLocationLabel(move.target)}</td>
                      <td className="remains-page__table-cell">{move.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {movementsTotalPages > 0 && (
                <div className="remains-page__pagination">
                  <button
                    onClick={() => setMovementsPage(p => Math.max(0, p - 1))}
                    disabled={movementsPage === 0}
                    className="remains-page__btn-secondary"
                  >
                    Назад
                  </button>
                  <span className="remains-page__pagination-info">
                    Страница {movementsPage + 1} из {movementsTotalPages}
                  </span>
                  <button
                    onClick={() => setMovementsPage(p => Math.min(movementsTotalPages - 1, p + 1))}
                    disabled={movementsPage >= movementsTotalPages - 1}
                    className="remains-page__btn-secondary"
                  >
                    Вперёд
                  </button>
                  <span style={{ marginLeft: 20, color: '#64748b' }}>
                    Всего записей: {movementsTotalElements}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="remains-page__card">
        <h3 className="remains-page__card-title">Товары с низкими остатками</h3>
        <div className="remains-page__filter-row" style={{ marginBottom: 16 }}>
          <span>Порог (шт):</span>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => handleThresholdChange(e.target.value)}
            min="0"
            max={MAX_THRESHOLD}
            className="remains-page__input remains-page__w-100"
          />
          <button onClick={() => { setLowStockPage(0); loadLowStock(); }} className="remains-page__btn-secondary">Обновить</button>
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="remains-page__empty">Нет товаров с низкими остатками</div>
        ) : (
          <>
            <table className="remains-page__table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Остаток в баре</th>
                  <th>Остаток на складе</th>
                  <th>Всего</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((item) => (
                  <tr key={item.productId}>
                    <td className="remains-page__table-cell">{item.productName}</td>
                    <td className="remains-page__table-cell" style={{ fontWeight: 600, color: '#9a3412' }}>{item.bar} шт</td>
                    <td className="remains-page__table-cell">{item.warehouse} шт</td>
                    <td className="remains-page__table-cell">{(item.bar + item.warehouse)} шт</td>
                    <td className="remains-page__table-cell">
                      <button onClick={() => handleSelectProduct(item.productId)} className="remains-page__btn-secondary">
                        Перейти к товару
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {lowStockTotalPages > 1 && (
              <div className="remains-page__pagination">
                <button
                  onClick={() => setLowStockPage(p => Math.max(0, p - 1))}
                  disabled={lowStockPage === 0}
                  className="remains-page__btn-secondary"
                >
                  Назад
                </button>
                <span className="remains-page__pagination-info">
                  Страница {lowStockPage + 1} из {lowStockTotalPages}
                </span>
                <button
                  onClick={() => setLowStockPage(p => Math.min(lowStockTotalPages - 1, p + 1))}
                  disabled={lowStockPage >= lowStockTotalPages - 1}
                  className="remains-page__btn-secondary"
                >
                  Вперёд
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showAdjustBar && (
        <div className="remains-page__modal-overlay">
          <div className="remains-page__modal">
            <h3>Корректировка остатка в баре</h3>
            <p>Товар: <strong>{selectedProduct?.name}</strong></p>
            <p>Текущий остаток: <strong>{remains?.bar || 0} шт</strong></p>
            <input
              type="number"
              placeholder="Новое количество"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="remains-page__input remains-page__w-full"
              style={{ margin: '10px 0' }}
              min="0"
              max={MAX_QUANTITY}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              От 0 до {MAX_QUANTITY}
            </div>
            <div className="remains-page__btn-group" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAdjustBar(false); setAdjustQty(''); }} className="remains-page__btn-secondary">Отмена</button>
              <button onClick={handleAdjustBar} className="remains-page__btn">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {showAdjustWarehouse && (
        <div className="remains-page__modal-overlay">
          <div className="remains-page__modal">
            <h3>Корректировка остатка на складе</h3>
            <p>Товар: <strong>{selectedProduct?.name}</strong></p>
            <p>Текущий остаток: <strong>{remains?.warehouse || 0} шт</strong></p>
            <input
              type="number"
              placeholder="Новое количество"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="remains-page__input remains-page__w-full"
              style={{ margin: '10px 0' }}
              min="0"
              max={MAX_QUANTITY}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              От 0 до {MAX_QUANTITY}
            </div>
            <div className="remains-page__btn-group" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAdjustWarehouse(false); setAdjustQty(''); }} className="remains-page__btn-secondary">Отмена</button>
              <button onClick={handleAdjustWarehouse} className="remains-page__btn">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="remains-page__modal-overlay">
          <div className="remains-page__modal">
            <h3>Перемещение со склада в бар</h3>
            <p>Товар: <strong>{selectedProduct?.name}</strong></p>
            <p>На складе: <strong>{remains?.warehouse || 0} шт</strong></p>
            <p>В баре: <strong>{remains?.bar || 0} шт</strong></p>
            <input
              type="number"
              placeholder="Количество для перемещения"
              value={transferQty}
              onChange={(e) => setTransferQty(e.target.value)}
              className="remains-page__input remains-page__w-full"
              style={{ margin: '10px 0' }}
              min="1"
              max={Math.min(remains?.warehouse || 0, MAX_QUANTITY)}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              От 1 до {Math.min(remains?.warehouse || 0, MAX_QUANTITY)} (доступно на складе)
            </div>
            <div className="remains-page__btn-group" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowTransfer(false); setTransferQty(''); }} className="remains-page__btn-secondary">Отмена</button>
              <button onClick={handleTransfer} className="remains-page__btn">Переместить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}