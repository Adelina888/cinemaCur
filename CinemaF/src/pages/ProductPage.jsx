// src/pages/ProductPage.jsx
import React, { useEffect, useState } from 'react'
import { ProductApi } from '../services/ProductApi'

export const ProductPage = () => {
  // Состояния для данных
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Состояния для пагинации
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)
  
  // Состояния для поиска и фильтра
  const [searchName, setSearchName] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  
  // Состояния для формы добавления
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [expirationDays, setExpirationDays] = useState('')
  
  // Состояния для редактирования
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editExpirationDays, setEditExpirationDays] = useState('')

  // Список категорий
  const categories = [
    { value: 'Закуски', label: 'Закуски' },
    { value: 'Напитки', label: 'Напитки' },
    { value: 'Сладости', label: 'Сладости' },
    { value: 'Прочее', label: 'Прочее' }
  ]

  // ========== ВАЛИДАЦИЯ ==========
  const validateProduct = (data, isUpdate = false, existingProducts = []) => {
    // 1. Проверка названия
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

    // 2. Проверка уникальности названия (нельзя дублировать)
    const isDuplicate = existingProducts.some(p => 
      p.name.toLowerCase() === data.name.toLowerCase() && 
      (!isUpdate || p.id !== data.id)
    )
    if (isDuplicate) {
      alert(`Товар с названием "${data.name}" уже существует!`)
      return false
    }

    // 3. Проверка цены
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

    // 4. Проверка категории
    if (!data.category) {
      alert('Выберите категорию')
      return false
    }

    // 5. Проверка срока годности (обязателен)
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

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const loadProducts = async () => {
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
  }

  // ========== ФИЛЬТРАЦИЯ И ПОИСК (на клиенте) ==========
  const applyFilters = (data, nameFilter, categoryFilter) => {
    let filtered = [...data]
    if (nameFilter) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(nameFilter.toLowerCase()))
    }
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }
    setFilteredProducts(filtered)
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchName(value)
    applyFilters(products, value, filterCategory)
  }

  const handleFilterCategory = (e) => {
    const value = e.target.value
    setFilterCategory(value)
    applyFilters(products, searchName, value)
  }

  const clearFilters = () => {
    setSearchName('')
    setFilterCategory('')
    setFilteredProducts(products)
  }

  // ========== CRUD ОПЕРАЦИИ ==========
  const handleCreate = async (e) => {
    e.preventDefault()
    
    // Валидация перед отправкой
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
    // Валидация при обновлении
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

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const getStatusText = (product) => {
    if (product.isExpired) return ' ПРОСРОЧЕН'
    if (product.daysLeft <= 3) return ` Истекает через ${product.daysLeft} дней`
    return ` Годен (ещё ${product.daysLeft} дней)`
  }

  const getStatusStyle = (product) => {
    if (product.isExpired) return { color: 'red', fontWeight: 'bold' }
    if (product.daysLeft <= 3) return { color: 'orange', fontWeight: 'bold' }
    return { color: 'green' }
  }

  // ========== ЗАГРУЗКА ПРИ ИЗМЕНЕНИИ СТРАНИЦЫ ==========
  useEffect(() => {
    loadProducts()
  }, [page])

  if (loading) return <div>Загрузка...</div>

  // ========== РЕНДЕР ==========
  return (
    <div>
      <h1>Товары бара</h1>

      {/* Панель поиска и фильтрации */}
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по названию"
            value={searchName}
            onChange={handleSearch}
            style={{ padding: 8, width: 200 }}
          />
          <select value={filterCategory} onChange={handleFilterCategory} style={{ padding: 8 }}>
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button onClick={clearFilters}>Сбросить фильтры</button>
        </div>
      </div>

      {/* Форма добавления */}
      <form onSubmit={handleCreate} style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <h3>Добавить товар</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: 8 }}
          />
          <div>
            <input
              type="number"
              placeholder="Цена"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{ padding: 8 }}
              step="0.01"
              min="0.01"
              max="1000000"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              От 0.01 до 1 000 000 ₽
            </div>
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ padding: 8 }}>
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <div>
            <input
              type="number"
              placeholder="Срок годности (дни)"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              required
              style={{ padding: 8 }}
              min="0"
              max="3650"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              От 0 до 3650 дней (0 = без срока)
            </div>
          </div>
          <button type="submit">Добавить</button>
        </div>
      </form>

      {/* Таблица товаров */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Категория</th>
            <th>Срок годности</th>
            <th>Дата создания</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              {editingId === product.id ? (
                // Режим редактирования
                <>
                  <td>{product.id}</td>
                  <td>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      style={{ width: '80px' }}
                      step="0.01"
                      min="0.01"
                      max="1000000"
                    />
                  </td>
                  <td>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editExpirationDays}
                      onChange={(e) => setEditExpirationDays(e.target.value)}
                      style={{ width: '80px' }}
                      min="0"
                      max="3650"
                    />
                  </td>
                  <td>{product.dateOfCreation}</td>
                  <td style={getStatusStyle(product)}>{getStatusText(product)}</td>
                  <td>
                    <button onClick={() => handleUpdate(product.id)} style={{ marginRight: 5 }}>Сохранить</button>
                    <button onClick={cancelEdit}>Отмена</button>
                  </td>
                </>
              ) : (
                // Режим просмотра
                <>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.price} ₽</td>
                  <td>{product.category}</td>
                  <td>{product.expirationDays} дней</td>
                  <td>{product.dateOfCreation}</td>
                  <td style={getStatusStyle(product)}>{getStatusText(product)}</td>
                  <td>
                    <button onClick={() => startEdit(product)} style={{ marginRight: 5 }}>Редактировать</button>
                    <button onClick={() => handleDelete(product.id)}>Удалить</button>
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
            Страница {page + 1} из {totalPages} (всего {totalElements} товаров)
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