import React, { useEffect, useState, useCallback } from 'react'
import { ComboApi } from '../../services/ComboApi'
import { ProductApi } from '../../services/ProductApi'
import { Pagination } from '../../components/Pagination'
import './ComboPage.css'

export const ComboPage = () => {
  const [combos, setCombos] = useState([])
  const [filteredCombos, setFilteredCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableProducts, setAvailableProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)
  const [searchName, setSearchName] = useState('')
  const [filterActive, setFilterActive] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1)

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDiscountPercent, setEditDiscountPercent] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSelectedProducts, setEditSelectedProducts] = useState([])
  const [editIsActive, setEditIsActive] = useState(true)
  const [editSelectedProductId, setEditSelectedProductId] = useState('')
  const [editSelectedProductQuantity, setEditSelectedProductQuantity] = useState(1)

  const activeFilters = [
    { value: '', label: 'Все' },
    { value: 'true', label: 'Активные' },
    { value: 'false', label: 'Неактивные' }
  ]

  const formatProductsList = (products) => {
    if (!products || products.length === 0) return '-'
    return products.map(p => `${p.productName} (${p.quantity} шт)`).join(', ')
  }

  const loadProducts = useCallback(async () => {
    try {
      const data = await ProductApi.getAll()
      setAvailableProducts(data)
    } catch (error) {
      console.error('Ошибка загрузки товаров', error)
    }
  }, [])

  const loadCombos = useCallback(async () => {
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
  }, [page, pageSize])

  const applyFilters = useCallback(() => {
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
  }, [combos, searchName, filterActive])

  useEffect(() => {
    loadCombos()
  }, [loadCombos])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const calculateRegularPrice = (products) => {
    return products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  }

  const calculateComboPrice = (regularPrice, discountPercent) => {
    return regularPrice * (100 - discountPercent) / 100
  }

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

  const openAddForm = () => setShowAddForm(true)
  const closeAddForm = () => {
    setShowAddForm(false)
    setName('')
    setDiscountPercent('')
    setDescription('')
    setSelectedProducts([])
    setSelectedProductId('')
    setSelectedProductQuantity(1)
  }

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
      closeAddForm()
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

  const getStatusLabel = (isActive) => {
    return isActive ? 'Активен' : 'Неактивен'
  }

  if (loading) {
    return (
      <div className="combo-page">
        <div className="combo-page__loading">
          <div className="combo-page__spinner" />
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="combo-page">
      <h1 className="combo-page__header">Комбо-предложения</h1>
      
      <div className="combo-page__add-button-container">
        <button onClick={openAddForm} className="combo-page__btn-primary">
          + Добавить комбо
        </button>
      </div>

      {showAddForm && (
        <div className="combo-page__modal">
          <div className="combo-page__modal-content">
            <div className="combo-page__modal-header">
              <h3>Добавить комбо</h3>
              <button className="combo-page__modal-close" onClick={closeAddForm}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="combo-page__form-grid">
                <div className="combo-page__form-field">
                  <label className="combo-page__label">Название *</label>
                  <input
                    type="text"
                    placeholder="Введите название комбо"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="combo-page__input"
                    maxLength="100"
                  />
                  <span className="combo-page__helper">2-100 символов</span>
                </div>
                
                <div className="combo-page__form-field">
                  <label className="combo-page__label">Скидка % *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    required
                    className="combo-page__input"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="combo-page__helper">0-100%</span>
                </div>
                
                <div className="combo-page__form-field combo-page__full-width">
                  <label className="combo-page__label">Описание</label>
                  <input
                    type="text"
                    placeholder="Описание комбо"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="combo-page__input"
                    maxLength="500"
                  />
                </div>
              </div>
              
              <div className="combo-page__products-section">
                <h4>Товары в комбо *</h4>
                <div className="combo-page__add-product-row">
                  <select 
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(e.target.value)} 
                    className="combo-page__select"
                  >
                    <option value="">Выберите товар</option>
                    {availableProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.price} руб.)</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Количество"
                    value={selectedProductQuantity}
                    onChange={(e) => setSelectedProductQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="combo-page__input"
                    style={{ width: 100 }}
                  />
                  <button type="button" onClick={addProductToCombo} className="combo-page__btn-secondary">
                    Добавить товар
                  </button>
                </div>
                
                {selectedProducts.length > 0 && (
                  <table className="combo-page__products-table">
                    <thead>
                      <tr>
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
                          <td>{p.price} руб.</td>
                          <td>
                            <input
                              type="number"
                              value={p.quantity}
                              onChange={(e) => updateProductQuantity(idx, parseInt(e.target.value) || 1)}
                              min="1"
                              className="combo-page__input"
                              style={{ width: 70 }}
                            />
                          </td>
                          <td>{p.price * p.quantity} руб.</td>
                          <td>
                            <button 
                              type="button" 
                              onClick={() => removeProductFromCombo(idx)}
                              className="combo-page__btn-danger"
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="combo-page__total-label">Итого обычная цена:</td>
                        <td colSpan="2">{calculateRegularPrice(selectedProducts)} руб.</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="combo-page__total-label">Цена со скидкой {discountPercent || 0}%:</td>
                        <td colSpan="2">
                          {calculateComboPrice(calculateRegularPrice(selectedProducts), parseFloat(discountPercent || 0)).toFixed(2)} руб.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
              
              <div className="combo-page__modal-footer">
                <button type="button" onClick={closeAddForm} className="combo-page__btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="combo-page__btn-primary">
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="combo-page__card">
        <h3 className="combo-page__card-title">Поиск и фильтрация</h3>
        <div className="combo-page__filter-row">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="combo-page__input combo-page__w-220"
          />
          <select 
            value={filterActive} 
            onChange={(e) => setFilterActive(e.target.value)} 
            className="combo-page__select"
          >
            {activeFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <button 
            onClick={() => { setSearchName(''); setFilterActive(''); }} 
            className="combo-page__btn-secondary"
          >
            Сбросить
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="combo-page__table">
          <thead>
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
            {filteredCombos.length === 0 ? (
              <tr>
                <td colSpan="9" className="combo-page__empty">
                  {searchName || filterActive 
                    ? 'По вашему запросу ничего не найдено' 
                    : 'Список комбо пуст. Добавьте первое комбо выше!'}
                </td>
              </tr>
            ) : (
              filteredCombos.map((item) => {
                const statusClass = item.isActive 
                  ? 'combo-page__badge--success'
                  : 'combo-page__badge--danger'
                return (
                  <tr key={item.id} className={!item.isActive ? 'combo-page__row-inactive' : ''}>
                    {editingId === item.id ? (
                      <>
                        <td className="combo-page__table-cell">{item.id}</td>
                        <td className="combo-page__table-cell">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="combo-page__input"
                            maxLength="100"
                          />
                        </td>
                        <td className="combo-page__table-cell">
                          <div className="combo-page__edit-products">
                            <select 
                              value={editSelectedProductId} 
                              onChange={(e) => setEditSelectedProductId(e.target.value)} 
                              className="combo-page__select"
                              style={{ marginBottom: 8 }}
                            >
                              <option value="">Выберите товар</option>
                              {availableProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.price} руб.)</option>
                              ))}
                            </select>
                            <div className="combo-page__add-product-row" style={{ marginBottom: 8 }}>
                              <input
                                type="number"
                                placeholder="Кол-во"
                                value={editSelectedProductQuantity}
                                onChange={(e) => setEditSelectedProductQuantity(parseInt(e.target.value) || 1)}
                                min="1"
                                className="combo-page__input"
                                style={{ width: 80 }}
                              />
                              <button 
                                type="button" 
                                onClick={addProductToEditCombo}
                                className="combo-page__btn-secondary"
                                style={{ padding: '4px 12px' }}
                              >
                                Добавить
                              </button>
                            </div>
                            {editSelectedProducts.map((p, idx) => (
                              <div key={idx} className="combo-page__edit-product-item">
                                <span>{p.productName}</span>
                                <input
                                  type="number"
                                  value={p.quantity}
                                  onChange={(e) => updateEditProductQuantity(idx, parseInt(e.target.value) || 1)}
                                  min="1"
                                  style={{ width: 60 }}
                                />
                                <button onClick={() => removeProductFromEditCombo(idx)}>×</button>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="combo-page__table-cell">
                          {calculateRegularPrice(editSelectedProducts)} руб.
                        </td>
                        <td className="combo-page__table-cell">
                          {calculateComboPrice(calculateRegularPrice(editSelectedProducts), parseFloat(editDiscountPercent || 0)).toFixed(2)} руб.
                        </td>
                        <td className="combo-page__table-cell">
                          <input
                            type="number"
                            value={editDiscountPercent}
                            onChange={(e) => setEditDiscountPercent(e.target.value)}
                            className="combo-page__input"
                            style={{ width: 70 }}
                            min="0"
                            max="100"
                          />%
                        </td>
                        <td className="combo-page__table-cell">
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="combo-page__input"
                            maxLength="500"
                          />
                        </td>
                        <td className="combo-page__table-cell">
                          <select 
                            value={editIsActive ? 'true' : 'false'} 
                            onChange={(e) => setEditIsActive(e.target.value === 'true')}
                            className="combo-page__select"
                          >
                            <option value="true">Активен</option>
                            <option value="false">Неактивен</option>
                          </select>
                        </td>
                        <td className="combo-page__table-cell">
                          <div className="combo-page__btn-group">
                            <button onClick={() => handleUpdate(item.id)} className="combo-page__btn-success">
                              Сохранить
                            </button>
                            <button onClick={cancelEdit} className="combo-page__btn-secondary">
                              Отмена
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="combo-page__table-cell">{item.id}</td>
                        <td className="combo-page__table-cell combo-page__table-cell--name">{item.name}</td>
                        <td className="combo-page__table-cell" style={{ maxWidth: 250, fontSize: 12 }}>
                          {formatProductsList(item.products)}
                        </td>
                        <td className="combo-page__table-cell">{item.regularPrice} руб.</td>
                        <td className="combo-page__table-cell">{item.comboPrice} руб.</td>
                        <td className="combo-page__table-cell">{item.discountPercent}%</td>
                        <td className="combo-page__table-cell">{item.description || '-'}</td>
                        <td className="combo-page__table-cell">
                          <span className={`combo-page__badge ${statusClass}`}>{getStatusLabel(item.isActive)}</span>
                        </td>
                        <td className="combo-page__table-cell">
                          <div className="combo-page__btn-group">
                            <button onClick={() => startEdit(item)} className="combo-page__btn-secondary">
                              Редактировать
                            </button>
                            {item.isActive ? (
                              <button onClick={() => handleDeactivate(item.id)} className="combo-page__btn-danger">
                                Деактивировать
                              </button>
                            ) : (
                              <button onClick={() => handleHardDelete(item.id)} className="combo-page__btn-danger">
                                Удалить
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        totalElements={totalElements} 
        onPageChange={setPage} 
        label="комбо" 
      />
    </div>
  )
}