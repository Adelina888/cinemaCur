// src/pages/RemainsPage.jsx
import React, { useEffect, useState } from 'react'
import { RemainsApi } from '../services/RemainsApi'
import { ProductApi } from '../services/ProductApi'

export const RemainsPage = () => {
  // Состояния для данных
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [remains, setRemains] = useState(null)
  const [movements, setMovements] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)

  // Состояния для модальных окон
  const [showAdjustBar, setShowAdjustBar] = useState(false)
  const [showAdjustWarehouse, setShowAdjustWarehouse] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [adjustQty, setAdjustQty] = useState('')
  const [transferQty, setTransferQty] = useState('')

  // Максимальные значения
  const MAX_QUANTITY = 999
  const MAX_THRESHOLD = 999

  // Состояния для пагинации истории
  const [movementsPage, setMovementsPage] = useState(0)
  const [movementsTotalPages, setMovementsTotalPages] = useState(0)
  const [movementsTotalElements, setMovementsTotalElements] = useState(0)
  const [pageSize] = useState(10)

  // ========== ЗАГРУЗКА ТОВАРОВ ==========
  const loadProducts = async () => {
    try {
      const data = await ProductApi.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Ошибка загрузки товаров', error)
      alert('Ошибка загрузки товаров')
    }
  }

  // ========== ЗАГРУЗКА ОСТАТКОВ ПО ТОВАРУ ==========
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

  // ========== ЗАГРУЗКА ИСТОРИИ ДВИЖЕНИЙ ==========
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

  // ========== ЗАГРУЗКА ТОВАРОВ С НИЗКИМИ ОСТАТКАМИ ==========
  const loadLowStock = async () => {
    try {
      const data = await RemainsApi.checkLowStock(lowStockThreshold)
      setLowStockProducts(data)
    } catch (error) {
      console.error('Ошибка загрузки низких остатков', error)
    }
  }

  // ========== ВЫБОР ТОВАРА ==========
  const handleSelectProduct = async (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    setSelectedProduct(product)
    await loadRemains(productId)
    await loadMovements(productId, 0)
    setMovementsPage(0)
  }

  // ========== КОРРЕКТИРОВКА ОСТАТКОВ ==========
  const handleAdjustBar = async () => {
    let qty = parseInt(adjustQty)
    
    if (isNaN(qty)) {
      alert('Введите корректное количество')
      return
    }
    
    if (qty < 0) {
      alert('Количество не может быть отрицательным')
      return
    }
    
    if (qty > MAX_QUANTITY) {
      alert(`Количество не может превышать ${MAX_QUANTITY}`)
      return
    }
    
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
    
    if (isNaN(qty)) {
      alert('Введите корректное количество')
      return
    }
    
    if (qty < 0) {
      alert('Количество не может быть отрицательным')
      return
    }
    
    if (qty > MAX_QUANTITY) {
      alert(`Количество не может превышать ${MAX_QUANTITY}`)
      return
    }
    
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

  // ========== ПЕРЕМЕЩЕНИЕ ==========
  const handleTransfer = async () => {
    let qty = parseInt(transferQty)
    
    if (isNaN(qty)) {
      alert('Введите корректное количество')
      return
    }
    
    if (qty <= 0) {
      alert('Количество должно быть больше 0')
      return
    }
    
    if (qty > MAX_QUANTITY) {
      alert(`Количество не может превышать ${MAX_QUANTITY}`)
      return
    }
    
    if (qty > (remains?.warehouse || 0)) {
      alert(`Недостаточно товара на складе. Доступно: ${remains?.warehouse || 0} шт`)
      return
    }
    
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

  // ========== ИЗМЕНЕНИЕ ПОРОГА НИЗКИХ ОСТАТКОВ ==========
  const handleThresholdChange = (value) => {
    let newThreshold = parseInt(value)
    if (isNaN(newThreshold)) {
      newThreshold = 5
    }
    if (newThreshold < 0) {
      newThreshold = 0
    }
    if (newThreshold > MAX_THRESHOLD) {
      alert(`Порог не может превышать ${MAX_THRESHOLD}`)
      newThreshold = MAX_THRESHOLD
    }
    setLowStockThreshold(newThreshold)
  }

  // ========== ПОЛУЧЕНИЕ ТИПА ДВИЖЕНИЯ ==========
  const getMovementTypeLabel = (type) => {
    const types = {
      'ADJUST': ' Корректировка',
      'SALE': ' Продажа',
      'RETURN': ' Возврат',
      'TRANSFER': ' Перемещение',
      'INCOME': ' Поступление'
    }
    return types[type] || type
  }

  // ========== ПЕРЕВОД source И target НА РУССКИЙ ==========
  const getLocationLabel = (location) => {
    const locations = {
      'WAREHOUSE': 'Склад',
      'BAR': 'Бар',
      '': '-',
      null: '-'
    }
    return locations[location] || location || '-'
  }

  const getMovementTypeStyle = (type) => {
    const styles = {
      'ADJUST': { color: '#856404', backgroundColor: '#fff3cd' },
      'SALE': { color: '#721c24', backgroundColor: '#f8d7da' },
      'RETURN': { color: '#155724', backgroundColor: '#d4edda' },
      'TRANSFER': { color: '#0c5460', backgroundColor: '#d1ecf1' },
      'INCOME': { color: '#155724', backgroundColor: '#d4edda' }
    }
    return styles[type] || {}
  }

  // ========== ЗАГРУЗКА ТОВАРОВ ПРИ СТАРТЕ ==========
  useEffect(() => {
    loadProducts()
    loadLowStock()
  }, [])

  // ========== ЗАГРУЗКА ИСТОРИИ ПРИ СМЕНЕ СТРАНИЦЫ ==========
  useEffect(() => {
    if (selectedProduct) {
      loadMovements(selectedProduct.id, movementsPage)
    }
  }, [movementsPage])

  // ========== ЗАГРУЗКА НИЗКИХ ОСТАТКОВ ПРИ ИЗМЕНЕНИИ ПОРОГА ==========
  useEffect(() => {
    loadLowStock()
  }, [lowStockThreshold])

  return (
    <div>
      <h1>Учет остатков</h1>

      {/* Панель выбора товара */}
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <h3>Выберите товар</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select 
            value={selectedProduct?.id || ''} 
            onChange={(e) => handleSelectProduct(e.target.value)}
            style={{ padding: 8, width: 300 }}
          >
            <option value="">-- Выберите товар --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Карточка остатков выбранного товара */}
      {selectedProduct && (
        <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
          <h3>Остатки: {selectedProduct.name}</h3>
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 30, marginBottom: 20 }}>
                <div style={{ padding: 15, backgroundColor: '#e8f4f8', borderRadius: 5, minWidth: 150 }}>
                  <h4>Бар (остаток)</h4>
                  <p style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>{remains?.bar || 0} шт</p>
                </div>
                <div style={{ padding: 15, backgroundColor: '#e8f4f8', borderRadius: 5, minWidth: 150 }}>
                  <h4>Склад (остаток)</h4>
                  <p style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>{remains?.warehouse || 0} шт</p>
                </div>
                <div style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 5, minWidth: 150 }}>
                  <h4>Всего</h4>
                  <p style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
                    {(remains?.bar || 0) + (remains?.warehouse || 0)} шт
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setShowAdjustBar(true)}> Скорректировать бар</button>
                <button onClick={() => setShowAdjustWarehouse(true)}> Скорректировать склад</button>
                <button onClick={() => setShowTransfer(true)}> Переместить со склада в бар</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Таблица истории движений */}
      {selectedProduct && (
        <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
          <h3>История движений: {selectedProduct.name}</h3>
          {movementsLoading ? (
            <div>Загрузка...</div>
          ) : movements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
              Нет записей о движениях
            </div>
          ) : (
            <>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f0f0f0' }}>
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
                    <tr key={move.id} style={getMovementTypeStyle(move.type)}>
                      <td>{new Date(move.createdAt).toLocaleString()}</td>
                      <td>{getMovementTypeLabel(move.type)}</td>
                      <td>{move.quantity}</td>
                      <td>{getLocationLabel(move.source)}</td>
                      <td>{getLocationLabel(move.target)}</td>
                      <td>{move.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Пагинация истории с общим количеством записей */}
              {movementsTotalPages > 0 && (
                <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setMovementsPage(p => Math.max(0, p - 1))}
                    disabled={movementsPage === 0}
                  >
                    ◀ Назад
                  </button>
                  <span>Страница {movementsPage + 1} из {movementsTotalPages}</span>
                  <button
                    onClick={() => setMovementsPage(p => Math.min(movementsTotalPages - 1, p + 1))}
                    disabled={movementsPage >= movementsTotalPages - 1}
                  >
                    Вперёд ▶
                  </button>
                  <span style={{ marginLeft: 20, color: '#666' }}>
                     Всего записей: {movementsTotalElements}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Секция "Низкие остатки" */}
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <h3>Товары с низкими остатками</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 15 }}>
          <span>Порог (шт):</span>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => handleThresholdChange(e.target.value)}
            min="0"
            max={MAX_THRESHOLD}
            style={{ padding: 5, width: 100 }}
          />
          <button onClick={loadLowStock}>Обновить</button>
        </div>
        {lowStockProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
            Нет товаров с низкими остатками
          </div>
        ) : (
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f0f0f0' }}>
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
                <tr key={item.productId} style={{ backgroundColor: '#fff3cd' }}>
                  <td>{item.productName}</td>
                  <td style={{ fontWeight: 'bold', color: '#856404' }}>{item.bar} шт</td>
                  <td>{item.warehouse} шт</td>
                  <td>{(item.bar + item.warehouse)} шт</td>
                  <td>
                    <button onClick={() => handleSelectProduct(item.productId)}>
                      Перейти к товару
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальное окно – корректировка бара */}
      {showAdjustBar && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, minWidth: 350 }}>
            <h3>Корректировка остатка в баре</h3>
            <p>Товар: <strong>{selectedProduct?.name}</strong></p>
            <p>Текущий остаток: <strong>{remains?.bar || 0} шт</strong></p>
            <input
              type="number"
              placeholder="Новое количество"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '10px 0' }}
              min="0"
              max={MAX_QUANTITY}
            />
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              От 0 до {MAX_QUANTITY}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAdjustBar(false); setAdjustQty(''); }}>Отмена</button>
              <button onClick={handleAdjustBar}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно – корректировка склада */}
      {showAdjustWarehouse && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, minWidth: 350 }}>
            <h3>Корректировка остатка на складе</h3>
            <p>Товар: <strong>{selectedProduct?.name}</strong></p>
            <p>Текущий остаток: <strong>{remains?.warehouse || 0} шт</strong></p>
            <input
              type="number"
              placeholder="Новое количество"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '10px 0' }}
              min="0"
              max={MAX_QUANTITY}
            />
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              От 0 до {MAX_QUANTITY}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAdjustWarehouse(false); setAdjustQty(''); }}>Отмена</button>
              <button onClick={handleAdjustWarehouse}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно – перемещение */}
      {showTransfer && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, minWidth: 350 }}>
            <h3>Перемещение со склада в бар</h3>
            <p>Товар: <strong>{selectedProduct?.name}</strong></p>
            <p>На складе: <strong>{remains?.warehouse || 0} шт</strong></p>
            <p>В баре: <strong>{remains?.bar || 0} шт</strong></p>
            <input
              type="number"
              placeholder="Количество для перемещения"
              value={transferQty}
              onChange={(e) => setTransferQty(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '10px 0' }}
              min="1"
              max={Math.min(remains?.warehouse || 0, MAX_QUANTITY)}
            />
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              От 1 до {Math.min(remains?.warehouse || 0, MAX_QUANTITY)} (доступно на складе)
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowTransfer(false); setTransferQty(''); }}>Отмена</button>
              <button onClick={handleTransfer}>Переместить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}