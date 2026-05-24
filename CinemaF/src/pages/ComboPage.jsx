// src/pages/ComboPage.jsx
import React, { useEffect, useState } from 'react'
import { ComboApi } from '../services/ComboApi'
import { ProductApi } from '../services/ProductApi'

export const ComboPage = () => {
  // Состояния для данных
  const [combos, setCombos] = useState([])
  const [filteredCombos, setFilteredCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableProducts, setAvailableProducts] = useState([])

  // Состояния для пагинации
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  // Состояния для поиска и фильтра
  const [searchName, setSearchName] = useState('')
  const [filterActive, setFilterActive] = useState('')

  // Состояния для формы добавления
  const [name, setName] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1)

  // Состояния для редактирования
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDiscountPercent, setEditDiscountPercent] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSelectedProducts, setEditSelectedProducts] = useState([])
  const [editIsActive, setEditIsActive] = useState(true)
  const [editSelectedProductId, setEditSelectedProductId] = useState('')
  const [editSelectedProductQuantity, setEditSelectedProductQuantity] = useState(1)

  // Список статусов для фильтра
  const activeFilters = [
    { value: '', label: 'Все' },
    { value: 'true', label: 'Активные' },
    { value: 'false', label: 'Неактивные' }
  ]

  // ========== ФОРМАТИРОВАНИЕ СОСТАВА ==========
  const formatProductsList = (products) => {
    if (!products || products.length === 0) return '-'
    return products.map(p => `${p.productName} (${p.quantity} шт)`).join(', ')
  }

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const loadProducts = async () => {
    try {
      const data = await ProductApi.getAll()
      setAvailableProducts(data)
    } catch (error) {
      console.error('Ошибка загрузки товаров', error)
    }
  }

  const loadCombos = async () => {
    setLoading(true)
    try {
      const data = await ComboApi.getPage(page, pageSize)
      setCombos(data.content)
      setFilteredCombos(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error('Ошибка загрузки комбо', error)
      alert('Ошибка загрузки: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

  // ========== ФИЛЬТРАЦИЯ И ПОИСК ==========
  const applyFilters = () => {
    let filtered = [...combos]
    
    if (searchName) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchName.toLowerCase())
      )
    }
    if (filterActive !== '') {
      filtered = filtered.filter(item => item.isActive === (filterActive === 'true'))
    }
    
    setFilteredCombos(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [searchName, filterActive, combos])

  useEffect(() => {
    loadCombos()
    loadProducts()
  }, [page])

  // ========== РАСЧЁТ ЦЕНЫ ==========
  const calculateRegularPrice = (products) => {
    return products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  }

  const calculateComboPrice = (regularPrice, discountPercent) => {
    return regularPrice * (100 - discountPercent) / 100
  }

  // ========== УПРАВЛЕНИЕ ТОВАРАМИ (создание) ==========
  const addProductToCombo = () => {
    if (!selectedProductId) {
      alert('Выберите товар')
      return
    }
    const product = availableProducts.find(p => p.id === parseInt(selectedProductId))
    if (!product) return

    const existingIndex = selectedProducts.findIndex(p => p.productId === product.id)
    if (existingIndex !== -1) {
      const updated = [...selectedProducts]
      updated[existingIndex].quantity += selectedProductQuantity
      setSelectedProducts(updated)
    } else {
      setSelectedProducts([...selectedProducts, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: selectedProductQuantity
      }])
    }
    setSelectedProductId('')
    setSelectedProductQuantity(1)
  }

  const removeProductFromCombo = (index) => {
    const updated = [...selectedProducts]
    updated.splice(index, 1)
    setSelectedProducts(updated)
  }

  const updateProductQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      alert('Количество должно быть не менее 1')
      return
    }
    const updated = [...selectedProducts]
    updated[index].quantity = newQuantity
    setSelectedProducts(updated)
  }

  // ========== УПРАВЛЕНИЕ ТОВАРАМИ (редактирование) ==========
  const addProductToEditCombo = () => {
    if (!editSelectedProductId) {
      alert('Выберите товар')
      return
    }
    const product = availableProducts.find(p => p.id === parseInt(editSelectedProductId))
    if (!product) return

    const existingIndex = editSelectedProducts.findIndex(p => p.productId === product.id)
    if (existingIndex !== -1) {
      const updated = [...editSelectedProducts]
      updated[existingIndex].quantity += editSelectedProductQuantity
      setEditSelectedProducts(updated)
    } else {
      setEditSelectedProducts([...editSelectedProducts, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: editSelectedProductQuantity
      }])
    }
    setEditSelectedProductId('')
    setEditSelectedProductQuantity(1)
  }

  const removeProductFromEditCombo = (index) => {
    const updated = [...editSelectedProducts]
    updated.splice(index, 1)
    setEditSelectedProducts(updated)
  }

  const updateEditProductQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      alert('Количество должно быть не менее 1')
      return
    }
    const updated = [...editSelectedProducts]
    updated[index].quantity = newQuantity
    setEditSelectedProducts(updated)
  }

  // ========== ВАЛИДАЦИЯ ==========
  const validateCombo = (data, isUpdate = false, existingCombos = []) => {
    if (!data.name || data.name.trim() === '') {
      alert('Название комбо обязательно')
      return false
    }
    if (data.name.length < 2) {
      alert('Название должно содержать минимум 2 символа')
      return false
    }
    if (data.name.length > 100) {
      alert('Название не должно превышать 100 символов')
      return false
    }

    const isDuplicate = existingCombos.some(item =>
      item.name.toLowerCase() === data.name.toLowerCase() &&
      (!isUpdate || item.id !== data.id)
    )
    if (isDuplicate) {
      alert(`Комбо с названием "${data.name}" уже существует!`)
      return false
    }

    if (data.discountPercent === undefined || data.discountPercent === '') {
      alert('Скидка обязательна')
      return false
    }
    const discount = Number(data.discountPercent)
    if (isNaN(discount) || discount < 0 || discount > 100) {
      alert('Скидка должна быть от 0 до 100 процентов')
      return false
    }

    if (!data.products || data.products.length === 0) {
      alert('Добавьте хотя бы один товар в комбо')
      return false
    }

    return true
  }

  // ========== CRUD ==========
  const handleCreate = async (e) => {
    e.preventDefault()

    if (!validateCombo({
      name,
      discountPercent: parseFloat(discountPercent),
      products: selectedProducts
    }, false, combos)) {
      return
    }

    try {
      await ComboApi.create({
        name,
        discountPercent: parseFloat(discountPercent),
        description,
        products: selectedProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity
        }))
      })
      setName('')
      setDiscountPercent('')
      setDescription('')
      setSelectedProducts([])
      loadCombos()
    } catch (error) {
      console.error('Ошибка создания', error)
      alert('Ошибка создания: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  const handleDeactivate = async (id) => {
    if (window.confirm('Деактивировать комбо?')) {
      try {
        await ComboApi.delete(id)
        loadCombos()
      } catch (error) {
        console.error('Ошибка деактивации', error)
        alert('Ошибка деактивации: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleHardDelete = async (id) => {
    if (window.confirm('Удалить комбо полностью? Это действие нельзя отменить.')) {
      try {
        await ComboApi.hardDelete(id)
        loadCombos()
      } catch (error) {
        console.error('Ошибка удаления', error)
        alert('Ошибка удаления: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
      }
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditDiscountPercent(item.discountPercent)
    setEditDescription(item.description || '')
    setEditSelectedProducts(item.products.map(p => ({
      productId: p.productId,
      productName: p.productName,
      price: p.price,
      quantity: p.quantity
    })))
    setEditIsActive(item.isActive)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (id) => {
    if (!validateCombo({
      id: id,
      name: editName,
      discountPercent: parseFloat(editDiscountPercent),
      products: editSelectedProducts
    }, true, combos)) {
      return
    }

    try {
      await ComboApi.update(id, {
        name: editName,
        discountPercent: parseFloat(editDiscountPercent),
        description: editDescription,
        isActive: editIsActive,
        products: editSelectedProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity
        }))
      })
      setEditingId(null)
      loadCombos()
    } catch (error) {
      console.error('Ошибка обновления', error)
      alert('Ошибка обновления: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ==========
  const getStatusLabel = (isActive) => {
    return isActive ? ' Активен' : ' Неактивен'
  }

  const getStatusStyle = (isActive) => {
    return isActive ? { color: 'green', fontWeight: 'bold' } : { color: 'red', fontWeight: 'bold' }
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <h1>Комбо-предложения</h1>

      {/* Панель поиска и фильтрации */}
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по названию"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ padding: 8, width: 200 }}
          />
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} style={{ padding: 8 }}>
            {activeFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <button onClick={() => { setSearchName(''); setFilterActive(''); }}>Сбросить фильтры</button>
        </div>
      </div>

      {/* Форма добавления */}
      <form onSubmit={handleCreate} style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <h3>Добавить комбо</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Название комбо"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: 8, width: 200 }}
              maxLength="100"
            />
            <input
              type="number"
              placeholder="Скидка %"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
              style={{ padding: 8, width: 100 }}
              min="0"
              max="100"
              step="1"
            />
            <input
              type="text"
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: 8, width: 300 }}
              maxLength="500"
            />
          </div>
          
          <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
            <h4>Товары в комбо</h4>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <select 
                value={selectedProductId} 
                onChange={(e) => setSelectedProductId(e.target.value)} 
                style={{ padding: 8, width: 200 }}
              >
                <option value="">Выберите товар</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.price} ₽)</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Количество"
                value={selectedProductQuantity}
                onChange={(e) => setSelectedProductQuantity(parseInt(e.target.value) || 1)}
                min="1"
                style={{ padding: 8, width: 100 }}
              />
              <button type="button" onClick={addProductToCombo}>Добавить товар</button>
            </div>
            
            {selectedProducts.length > 0 && (
              <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th>Товар</th>
                    <th>Цена</th>
                    <th>Количество</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.productName}</td>
                      <td>{p.price} ₽</td>
                      <td>
                        <input
                          type="number"
                          value={p.quantity}
                          onChange={(e) => updateProductQuantity(idx, parseInt(e.target.value) || 1)}
                          min="1"
                          style={{ width: 60 }}
                        />
                      </td>
                      <td>{p.price * p.quantity} ₽</td>
                      <td>
                        <button type="button" onClick={() => removeProductFromCombo(idx)}>✖</button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                    <td colSpan="3" align="right">Итого обычная цена:</td>
                    <td colSpan="2">{calculateRegularPrice(selectedProducts)} ₽</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                    <td colSpan="3" align="right">Цена со скидкой {discountPercent || 0}%:</td>
                    <td colSpan="2">{calculateComboPrice(calculateRegularPrice(selectedProducts), parseFloat(discountPercent || 0))} ₽</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          
          <button type="submit" style={{ padding: 8, width: 150 }}>Добавить комбо</button>
        </div>
      </form>

      {/* Таблица комбо */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Состав</th>
            <th>Обычная цена</th>
            <th>Цена со скидкой</th>
            <th>Скидка</th>
            <th>Описание</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredCombos.map((item) => (
            <tr key={item.id} style={{ backgroundColor: item.isActive ? 'white' : '#ffe6e6' }}>
              {editingId === item.id ? (
                <td colSpan="9" style={{ padding: '15px', backgroundColor: '#f9f9f9' }}>
                  <div>
                    <h4>Редактирование комбо</h4>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' }}>
                      <div>
                        <label>Название:</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength="100"
                          style={{ padding: 8, width: 200 }}
                        />
                      </div>
                      <div>
                        <label>Скидка %:</label>
                        <input
                          type="number"
                          value={editDiscountPercent}
                          onChange={(e) => setEditDiscountPercent(e.target.value)}
                          min="0"
                          max="100"
                          style={{ padding: 8, width: 80 }}
                        />
                      </div>
                      <div>
                        <label>Описание:</label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          maxLength="500"
                          style={{ padding: 8, width: 250 }}
                        />
                      </div>
                      <div>
                        <label>Статус:</label>
                        <select value={editIsActive} onChange={(e) => setEditIsActive(e.target.value === 'true')}>
                          <option value="true">Активен</option>
                          <option value="false">Неактивен</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 15, padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
                      <h5>Товары в комбо</h5>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <select 
                          value={editSelectedProductId} 
                          onChange={(e) => setEditSelectedProductId(e.target.value)} 
                          style={{ padding: 8, width: 200 }}
                        >
                          <option value="">Выберите товар</option>
                          {availableProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.price} ₽)</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Количество"
                          value={editSelectedProductQuantity}
                          onChange={(e) => setEditSelectedProductQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          style={{ padding: 8, width: 100 }}
                        />
                        <button type="button" onClick={addProductToEditCombo}>Добавить товар</button>
                      </div>

                      {editSelectedProducts.length > 0 && (
                        <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                              <th>Товар</th>
                              <th>Цена</th>
                              <th>Количество</th>
                              <th>Сумма</th>
                              <th>Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editSelectedProducts.map((p, idx) => (
                              <tr key={idx}>
                                <td>{p.productName}</td>
                                <td>{p.price} ₽</td>
                                <td>
                                  <input
                                    type="number"
                                    value={p.quantity}
                                    onChange={(e) => updateEditProductQuantity(idx, parseInt(e.target.value) || 1)}
                                    min="1"
                                    style={{ width: 60 }}
                                  />
                                </td>
                                <td>{p.price * p.quantity} ₽</td>
                                <td>
                                  <button type="button" onClick={() => removeProductFromEditCombo(idx)}>✖</button>
                                </td>
                              </tr>
                            ))}
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                              <td colSpan="3" align="right">Итого обычная цена:</td>
                              <td colSpan="2">{calculateRegularPrice(editSelectedProducts)} ₽</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                              <td colSpan="3" align="right">Цена со скидкой {editDiscountPercent || 0}%:</td>
                              <td colSpan="2">{calculateComboPrice(calculateRegularPrice(editSelectedProducts), parseFloat(editDiscountPercent || 0))} ₽</td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div style={{ marginTop: 15 }}>
                      <button onClick={() => handleUpdate(item.id)} style={{ marginRight: 10, padding: '5px 15px' }}>Сохранить</button>
                      <button onClick={cancelEdit} style={{ padding: '5px 15px' }}>Отмена</button>
                    </div>
                  </div>
                </td>
              ) : (
                <>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td style={{ maxWidth: '250px', fontSize: '12px' }}>
                    {formatProductsList(item.products)}
                  </td>
                  <td>{item.regularPrice} ₽</td>
                  <td>{item.comboPrice} ₽</td>
                  <td>{item.discountPercent}%</td>
                  <td>{item.description || '-'}</td>
                  <td style={getStatusStyle(item.isActive)}>{getStatusLabel(item.isActive)}</td>
                  <td>
                    <button onClick={() => startEdit(item)} style={{ marginRight: 5 }}>✏</button>
                    {item.isActive ? (
                      <button onClick={() => handleDeactivate(item.id)} style={{ marginRight: 5 }}>
                        🗑 Деактивировать
                      </button>
                    ) : (
                      <button onClick={() => handleHardDelete(item.id)} style={{ color: 'red' }}>
                        🗑 Удалить навсегда
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Пагинация */}
      {totalPages > 0 && (
        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ padding: '5px 10px' }}
          >
            ◀ Назад
          </button>
          <span>
            Страница {page + 1} из {totalPages} (всего {totalElements} комбо)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{ padding: '5px 10px' }}
          >
            Вперёд ▶
          </button>
        </div>
      )}
    </div>
  )
}