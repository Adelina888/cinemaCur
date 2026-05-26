import React, { useEffect, useState, useCallback } from 'react'
import { ProductApi } from '../../services/ProductApi'
import { Pagination } from '../../components/Pagination'
import './ProductPage.css'

export const ProductPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)
  const [searchName, setSearchName] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [expirationDays, setExpirationDays] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editExpirationDays, setEditExpirationDays] = useState('')

  const categories = [
    { value: 'Закуски', label: 'Закуски' },
    { value: 'Напитки', label: 'Напитки' },
    { value: 'Сладости', label: 'Сладости' },
    { value: 'Прочее', label: 'Прочее' }
  ]

  const validateProduct = (data, isUpdate = false, existingProducts = []) => {
    if (!data.name || data.name.trim() === '') {
      alert('Название товара обязательно')
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
    const isDuplicate = existingProducts.some(p => 
      p.name.toLowerCase() === data.name.toLowerCase() && 
      (!isUpdate || p.id !== data.id)
    )
    if (isDuplicate) {
      alert(`Товар с названием "${data.name}" уже существует!`)
      return false
    }
    if (!data.price && data.price !== 0) {
      alert('Цена обязательна')
      return false
    }
    if (isNaN(data.price)) {
      alert('Цена должна быть числом')
      return false
    }
    if (data.price <= 0) {
      alert('Цена должна быть больше 0')
      return false
    }
    if (data.price > 1000000) {
      alert('Цена не может превышать 1 000 000 рублей')
      return false
    }
    if (!data.category) {
      alert('Выберите категорию')
      return false
    }
    if (!data.expirationDays && data.expirationDays !== 0) {
      alert('Срок годности обязателен')
      return false
    }
    const days = Number(data.expirationDays)
    if (isNaN(days)) {
      alert('Срок годности должен быть числом')
      return false
    }
    if (days < 0) {
      alert('Срок годности не может быть отрицательным')
      return false
    }
    if (days > 3650) {
      alert('Срок годности не может превышать 10 лет (3650 дней)')
      return false
    }
    return true
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ProductApi.getPage(page, pageSize)
      setProducts(data.content)
      setFilteredProducts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error('Ошибка загрузки товаров', error)
      alert('Ошибка загрузки: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const applyFilters = useCallback(() => {
    let filtered = [...products]
    if (searchName) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()))
    }
    if (filterCategory) {
      filtered = filtered.filter(p => p.category === filterCategory)
    }
    setFilteredProducts(filtered)
  }, [products, searchName, filterCategory])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchName(value)
  }

  const handleFilterCategory = (e) => {
    const value = e.target.value
    setFilterCategory(value)
  }

  const clearFilters = () => {
    setSearchName('')
    setFilterCategory('')
    setFilteredProducts(products)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateProduct({
      name,
      price: parseFloat(price),
      category,
      expirationDays: parseInt(expirationDays)
    }, false, products)) {
      return
    }
    try {
      await ProductApi.create({
        name,
        price: parseFloat(price),
        category,
        expirationDays: parseInt(expirationDays)
      })
      setName('')
      setPrice('')
      setCategory('')
      setExpirationDays('')
      loadProducts()
    } catch (error) {
      console.error('Ошибка создания', error)
      const errorData = error.response?.data
      if (errorData?.field === 'name' || errorData?.message?.includes('существует')) {
        alert(`Товар с названием "${name}" уже существует!`)
      } else if (errorData?.field) {
        alert(`Ошибка в поле "${errorData.field}": ${errorData.message}`)
      } else {
        alert('Ошибка: ' + (errorData?.message || 'Неизвестная ошибка'))
      }
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await ProductApi.delete(id)
        loadProducts()
      } catch (error) {
        console.error('Ошибка удаления', error)
        alert('Ошибка удаления')
      }
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditName(product.name)
    setEditPrice(product.price)
    setEditCategory(product.category)
    setEditExpirationDays(product.expirationDays)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (id) => {
    if (!validateProduct({
      id: id,
      name: editName,
      price: parseFloat(editPrice),
      category: editCategory,
      expirationDays: parseInt(editExpirationDays)
    }, true, products)) {
      return
    }
    try {
      await ProductApi.update(id, {
        name: editName,
        price: parseFloat(editPrice),
        category: editCategory,
        expirationDays: parseInt(editExpirationDays)
      })
      setEditingId(null)
      loadProducts()
    } catch (error) {
      console.error('Ошибка обновления', error)
      const errorData = error.response?.data
      if (errorData?.field === 'name' || errorData?.message?.includes('существует')) {
        alert(`Товар с названием "${editName}" уже существует!`)
      } else if (errorData?.field) {
        alert(`Ошибка в поле "${errorData.field}": ${errorData.message}`)
      } else {
        alert('Ошибка обновления: ' + (errorData?.message || 'Неизвестная ошибка'))
      }
    }
  }

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-page__loading">
          <div className="product-page__spinner" />
          Загрузка товаров...
        </div>
      </div>
    )
  }

  return (
    <div className="product-page">
      <h1 className="product-page__header">Товары бара</h1>

      <div className="product-page__card">
        <h3 className="product-page__card-title">Поиск и фильтрация</h3>
        <div className="product-page__filter-row">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchName}
            onChange={handleSearch}
            className="product-page__input product-page__w-220"
          />
          <select 
            value={filterCategory} 
            onChange={handleFilterCategory} 
            className="product-page__select"
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button onClick={clearFilters} className="product-page__btn-secondary">
            Сбросить
          </button>
        </div>
      </div>

      <div className="product-page__card">
        <h3 className="product-page__card-title">Добавить новый товар</h3>
        <form onSubmit={handleCreate}>
          <div className="product-page__form-row">
            <div className="product-page__form-field">
              <label className="product-page__label">Название</label>
              <input
                type="text"
                placeholder="Введите название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="product-page__input product-page__w-180"
              />
            </div>
            <div className="product-page__form-field">
              <label className="product-page__label">Цена (руб.)</label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="product-page__input product-page__w-120"
                step="0.01"
                min="0.01"
                max="1000000"
              />
              <span className="product-page__helper">0.01 — 1 000 000</span>
            </div>
            <div className="product-page__form-field">
              <label className="product-page__label">Категория</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
                className="product-page__select product-page__w-140"
              >
                <option value="">Выберите...</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="product-page__form-field">
              <label className="product-page__label">Срок (дни)</label>
              <input
                type="number"
                placeholder="0"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                required
                className="product-page__input product-page__w-120"
                min="0"
                max="3650"
              />
              <span className="product-page__helper">0 — 3650</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="product-page__btn">
                Добавить
              </button>
            </div>
          </div>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="product-page__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Срок</th>
              <th>Создан</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="product-page__empty">
                  {searchName || filterCategory 
                    ? 'По вашему запросу ничего не найдено' 
                    : 'Список товаров пуст. Добавьте первый товар выше!'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const statusClass = product.isExpired || product.daysLeft <= 0
                  ? 'product-page__badge--danger'
                  : product.daysLeft <= 3 
                    ? 'product-page__badge--warning' 
                    : 'product-page__badge--success'
                const statusText = product.isExpired || product.daysLeft <= 0
                  ? 'Просрочен'
                  : product.daysLeft <= 3 
                    ? `Истекает: ${product.daysLeft} дн.` 
                    : `Годен: ${product.daysLeft} дн.`
                return (
                  <tr key={product.id}>
                    {editingId === product.id ? (
                      <>
                        <td className="product-page__table-cell">{product.id}</td>
                        <td className="product-page__table-cell">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="product-page__input product-page__w-full"
                          />
                        </td>
                        <td className="product-page__table-cell">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="product-page__input product-page__w-100"
                            step="0.01"
                            min="0.01"
                            max="1000000"
                          />
                        </td>
                        <td className="product-page__table-cell">
                          <select 
                            value={editCategory} 
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="product-page__select"
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="product-page__table-cell">
                          <input
                            type="number"
                            value={editExpirationDays}
                            onChange={(e) => setEditExpirationDays(e.target.value)}
                            className="product-page__input product-page__w-90"
                            min="0"
                            max="3650"
                          />
                        </td>
                        <td className="product-page__table-cell">{product.dateOfCreation}</td>
                        <td className="product-page__table-cell">
                          <span className={`product-page__badge ${statusClass}`}>{statusText}</span>
                        </td>
                        <td className="product-page__table-cell">
                          <div className="product-page__btn-group">
                            <button 
                              onClick={() => handleUpdate(product.id)} 
                              className="product-page__btn-success"
                            >Сохранить</button>
                            <button 
                              onClick={cancelEdit} 
                              className="product-page__btn-secondary"
                            >Отмена</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="product-page__table-cell">{product.id}</td>
                        <td className="product-page__table-cell product-page__table-cell--name">
                          {product.name}
                        </td>
                        <td className="product-page__table-cell">
                          {product.price.toLocaleString('ru-RU')} руб.
                        </td>
                        <td className="product-page__table-cell">{product.category}</td>
                        <td className="product-page__table-cell">{product.expirationDays} дн.</td>
                        <td className="product-page__table-cell product-page__table-cell--date">
                          {product.dateOfCreation}
                        </td>
                        <td className="product-page__table-cell">
                          <span className={`product-page__badge ${statusClass}`}>{statusText}</span>
                        </td>
                        <td className="product-page__table-cell">
                          <div className="product-page__btn-group">
                            <button 
                              onClick={() => startEdit(product)} 
                              className="product-page__btn-secondary"
                            >Редактировать</button>
                            <button 
                              onClick={() => handleDelete(product.id)} 
                              className="product-page__btn-danger"
                            >Удалить</button>
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
        label="товаров" 
      />
    </div>
  )
}