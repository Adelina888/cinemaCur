import React, { useEffect, useState } from 'react'
import { ProductApi } from '../services/ProductApi'

export const ProductPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // Форма добавления
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [expirationDays, setExpirationDays] = useState('')

  // Редактирование
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editExpirationDays, setEditExpirationDays] = useState('')

  // Карта для отображения русских названий категорий
  const categoryDisplay = {
    'SNACKS': 'Закуски',
    'DRINKS': 'Напитки',
    'SWEETS': 'Сладости',
    'OTHER': 'Прочее'
  }

  // Список категорий для выбора (английские значения)
const categories = [
  { value: 'Закуски', label: 'Закуски' },
  { value: 'Напитки', label: 'Напитки' },
  { value: 'Сладости', label: 'Сладости' },
  { value: 'Прочее', label: 'Прочее' }
]

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await ProductApi.getAll()
      setProducts(data)
      applyFilters(data, searchName, filterCategory)
    } catch (error) {
      console.error('Ошибка загрузки товаров', error)
      alert('Ошибка загрузки: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await ProductApi.create({
        name,
        price: parseFloat(price),
        category,           // ← английское значение (SNACKS, DRINKS, ...)
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
      if (errorData?.field) {
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
    setEditCategory(product.category)      // ← английское значение
    setEditExpirationDays(product.expirationDays || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (id) => {
    try {
      await ProductApi.update(id, {
        name: editName,
        price: parseFloat(editPrice),
        category: editCategory,              // ← английское значение
        expirationDays: parseInt(editExpirationDays)
      })
      setEditingId(null)
      loadProducts()
    } catch (error) {
      console.error('Ошибка обновления', error)
      const errorData = error.response?.data
      alert('Ошибка обновления: ' + (errorData?.message || 'Неизвестная ошибка'))
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const getStatusText = (product) => {
    if (product.isExpired) return ' ПРОСРОЧЕН'
    if (product.daysLeft <= 3) return `⚠️ Истекает через ${product.daysLeft} дней`
    return ` Годен (ещё ${product.daysLeft} дней)`
  }

  const getStatusStyle = (product) => {
    if (product.isExpired) return { color: 'red', fontWeight: 'bold' }
    if (product.daysLeft <= 3) return { color: 'orange', fontWeight: 'bold' }
    return { color: 'green' }
  }

  if (loading) return <div>Загрузка...</div>

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
          <input type="text" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: 8 }} />
          <input type="number" placeholder="Цена" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: 8 }} step="0.01" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ padding: 8 }}>
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <input type="number" placeholder="Срок годности (дни)" value={expirationDays} onChange={(e) => setExpirationDays(e.target.value)} required style={{ padding: 8 }} />
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
                <>
                  <td>{product.id}</td>
                  <td><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ width: '80px' }} step="0.01" /></td>
                  <td>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="number" value={editExpirationDays} onChange={(e) => setEditExpirationDays(e.target.value)} style={{ width: '80px' }} /></td>
                  <td>{product.dateOfCreation}</td>
                  <td style={getStatusStyle(product)}>{getStatusText(product)}</td>
                  <td>
                    <button onClick={() => handleUpdate(product.id)} style={{ marginRight: 5 }}>Сохранить</button>
                    <button onClick={cancelEdit}>Отмена</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.price} ₽</td>
                  <td>{categoryDisplay[product.category] || product.category}</td>
                  <td>{product.expirationDays ? `${product.expirationDays} дней` : 'Без срока'}</td>
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
    </div>
  )
}