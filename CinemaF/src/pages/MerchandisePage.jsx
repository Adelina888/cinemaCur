// src/pages/MerchandisePage.jsx
import React, { useEffect, useState } from 'react'
import { MerchandiseApi } from '../services/MerchandiseApi'

export const MerchandisePage = () => {
  // Состояния для данных
  const [merchandise, setMerchandise] = useState([])
  const [filteredMerchandise, setFilteredMerchandise] = useState([])
  const [loading, setLoading] = useState(true)

  // Состояния для пагинации
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  // Состояния для поиска и фильтра
  const [searchName, setSearchName] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Состояния для формы добавления
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState('')
  const [size, setSize] = useState('')
  const [material, setMaterial] = useState('')
  const [count, setCount] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Состояния для редактирования
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editType, setEditType] = useState('')
  const [editSize, setEditSize] = useState('')
  const [editMaterial, setEditMaterial] = useState('')
  const [editCount, setEditCount] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editStatus, setEditStatus] = useState('')

  // Список типов мерча (русские значения, которые принимает бэкенд)
  const types = [
    { value: 'Футболка', label: 'Футболка' },
    { value: 'Кружка', label: 'Кружка' },
    { value: 'Игрушка', label: 'Игрушка' },
    { value: 'Брелок', label: 'Брелок' },
    { value: 'Прочее', label: 'Прочее' }
  ]

  // Список размеров
  const sizes = [
    { value: '', label: 'Все' },
    { value: '42', label: '42' },
    { value: '44', label: '44' },
    { value: '46', label: '46' },
    { value: '48', label: '48' },
    { value: '50', label: '50' }
  ]

  // Список статусов для фильтра
  const statuses = [
    { value: '', label: 'Все' },
    { value: '1', label: 'Активен' },
    { value: '0', label: 'Неактивен' }
  ]

  // ========== ВАЛИДАЦИЯ ==========
  const validateMerchandise = (data, isUpdate = false, existingItems = []) => {
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

    // Проверка уникальности названия
    const isDuplicate = existingItems.some(item =>
      item.name.toLowerCase() === data.name.toLowerCase() &&
      (!isUpdate || item.id !== data.id)
    )
    if (isDuplicate) {
      alert(`Товар с названием "${data.name}" уже существует!`)
      return false
    }

    if (!data.price && data.price !== 0) {
      alert('Цена обязательна')
      return false
    }
    if (isNaN(data.price) || data.price <= 0) {
      alert('Цена должна быть больше 0')
      return false
    }
    if (data.price > 1000000) {
      alert('Цена не может превышать 1 000 000 рублей')
      return false
    }

    if (!data.type) {
      alert('Выберите тип товара')
      return false
    }

    if (data.material && data.material.length > 200) {
      alert('Материал не должен превышать 200 символов')
      return false
    }

    if (data.imageUrl && data.imageUrl.length > 500) {
      alert('URL изображения не должен превышать 500 символов')
      return false
    }

    if (data.size !== undefined && data.size !== null && data.size !== '') {
      const sizeValue = Number(data.size)
      if (isNaN(sizeValue)) {
        alert('Размер должен быть числом')
        return false
      }
      if (sizeValue < 0 || sizeValue > 100) {
        alert('Размер должен быть от 0 до 100')
        return false
      }
    }

    if (data.count !== undefined && data.count !== null && data.count !== '') {
      const qty = Number(data.count)
      if (isNaN(qty) || qty < 0) {
        alert('Количество не может быть отрицательным')
        return false
      }
      if (qty > 999999) {
        alert('Количество не может превышать 999 999')
        return false
      }
    }

    return true
  }

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const loadMerchandise = async () => {
    setLoading(true)
    try {
      const data = await MerchandiseApi.getPage(page, pageSize)
      setMerchandise(data.content)
      setFilteredMerchandise(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error('Ошибка загрузки мерча', error)
      alert('Ошибка загрузки: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

  // ========== ФИЛЬТРАЦИЯ И ПОИСК ==========
  const applyFilters = () => {
    let filtered = [...merchandise]
    
    if (searchName) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchName.toLowerCase())
      )
    }
    if (filterType) {
      filtered = filtered.filter(item => item.type === filterType)
    }
    if (filterSize) {
      filtered = filtered.filter(item => item.size === parseInt(filterSize))
    }
    if (filterStatus) {
      filtered = filtered.filter(item => item.status === parseInt(filterStatus))
    }
    
    setFilteredMerchandise(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [searchName, filterType, filterSize, filterStatus, merchandise])

  const handleSearch = (e) => {
    setSearchName(e.target.value)
  }

  const handleFilterType = (e) => {
    setFilterType(e.target.value)
  }

  const handleFilterSize = (e) => {
    setFilterSize(e.target.value)
  }

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value)
  }

  const clearFilters = () => {
    setSearchName('')
    setFilterType('')
    setFilterSize('')
    setFilterStatus('')
  }

  // ========== CRUD ОПЕРАЦИИ ==========
  const handleCreate = async (e) => {
    e.preventDefault()

    const countValue = count ? parseInt(count) : 0
    const sizeValue = size ? parseInt(size) : null

    if (!validateMerchandise({
      name,
      price: parseFloat(price),
      type,
      size: sizeValue,
      material,
      count: countValue,
      imageUrl
    }, false, merchandise)) {
      return
    }

    try {
      await MerchandiseApi.create({
        name,
        price: parseFloat(price),
        type,
        size: sizeValue,
        material,
        count: countValue,
        imageUrl,
        status: 1
      })
      setName('')
      setPrice('')
      setType('')
      setSize('')
      setMaterial('')
      setCount('')
      setImageUrl('')
      loadMerchandise()
    } catch (error) {
      console.error('Ошибка создания', error)
      alert('Ошибка создания: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  // Мягкое удаление (деактивация)
  const handleDeactivate = async (id) => {
    if (window.confirm('Деактивировать товар? (статус изменится на "Неактивен")')) {
      try {
        await MerchandiseApi.delete(id)
        loadMerchandise()
      } catch (error) {
        console.error('Ошибка деактивации', error)
        const msg = error.response?.data?.message || error.response?.data?.error || 'Неизвестная ошибка'
        alert(`Ошибка деактивации: ${msg}`)
      }
    }
  }

  // Физическое удаление
  const handleHardDelete = async (id, name) => {
    if (window.confirm(`Удалить товар "${name}" полностью? Это действие нельзя отменить.`)) {
      try {
        await MerchandiseApi.hardDelete(id)
        loadMerchandise()
      } catch (error) {
        console.error('Ошибка удаления', error)
        const msg = error.response?.data?.message || error.response?.data?.error || 'Неизвестная ошибка'
        alert(`Ошибка удаления: ${msg}`)
      }
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditPrice(item.price)
    setEditType(item.type)
    setEditSize(item.size || '')
    setEditMaterial(item.material || '')
    setEditCount(item.count)
    setEditImageUrl(item.imageUrl || '')
    setEditStatus(item.status)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (id) => {
    const countValue = editCount ? parseInt(editCount) : 0
    const sizeValue = editSize ? parseInt(editSize) : null

    if (!validateMerchandise({
      id: id,
      name: editName,
      price: parseFloat(editPrice),
      type: editType,
      size: sizeValue,
      material: editMaterial,
      count: countValue,
      imageUrl: editImageUrl
    }, true, merchandise)) {
      return
    }

    try {
      await MerchandiseApi.update(id, {
        name: editName,
        price: parseFloat(editPrice),
        type: editType,
        size: sizeValue,
        material: editMaterial,
        count: countValue,
        imageUrl: editImageUrl,
        status: parseInt(editStatus)
      })
      setEditingId(null)
      loadMerchandise()
    } catch (error) {
      console.error('Ошибка обновления', error)
      alert('Ошибка обновления: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const getTypeLabel = (typeValue) => {
    const found = types.find(t => t.value === typeValue)
    return found ? found.label : typeValue
  }

  const getStatusLabel = (status) => {
    return status === 1 ? '✅ Активен' : '❌ Неактивен'
  }

  const getStatusStyle = (status) => {
    return status === 1 ? { color: 'green', fontWeight: 'bold' } : { color: 'red', fontWeight: 'bold' }
  }

  // ========== ЗАГРУЗКА ПРИ ИЗМЕНЕНИИ СТРАНИЦЫ ==========
  useEffect(() => {
    loadMerchandise()
  }, [page])

  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <h1>Мерчендайз</h1>

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
          <select value={filterType} onChange={handleFilterType} style={{ padding: 8 }}>
            <option value="">Все типы</option>
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select value={filterSize} onChange={handleFilterSize} style={{ padding: 8 }}>
            {sizes.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={handleFilterStatus} style={{ padding: 8 }}>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button onClick={clearFilters}>Сбросить фильтры</button>
        </div>
      </div>

      {/* Форма добавления */}
      <form onSubmit={handleCreate} style={{ marginBottom: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5 }}>
        <h3>Добавить товар</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <input
              type="text"
              placeholder="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: 8 }}
              maxLength="100"
            />
            <div style={{ fontSize: '11px', color: '#666' }}>2-100 символов</div>
          </div>
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
            <div style={{ fontSize: '11px', color: '#666' }}>от 0.01 до 1 000 000 ₽</div>
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} required style={{ padding: 8 }}>
            <option value="">Выберите тип</option>
            {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div>
            <select value={size} onChange={(e) => setSize(e.target.value)} style={{ padding: 8 }}>
              <option value="">Размер (необязательно)</option>
              {sizes.slice(1).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <div style={{ fontSize: '11px', color:'#666' }}>0-100</div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Материал"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              style={{ padding: 8 }}
              maxLength="200"
            />
            <div style={{ fontSize: '11px', color: '#666' }}>до 200 символов</div>
          </div>
          <div>
            <input
              type="number"
              placeholder="Количество"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
              style={{ padding: 8 }}
              min="0"
              max="999999"
            />
            <div style={{ fontSize: '11px', color: '#666' }}>0 - 999 999</div>
          </div>
          <div>
            <input
              type="text"
              placeholder="URL изображения"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ padding: 8, width: 250 }}
              maxLength="500"
            />
            <div style={{ fontSize: '11px', color: '#666' }}>до 500 символов</div>
          </div>
          <button type="submit">Добавить</button>
        </div>
      </form>

      {/* Таблица товаров */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Фото</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Тип</th>
            <th>Размер</th>
            <th>Материал</th>
            <th>Количество</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredMerchandise.map((item) => (
            <tr key={item.id} style={{ backgroundColor: item.status === 0 ? '#ffe6e6' : 'white' }}>
              {editingId === item.id ? (
                // Режим редактирования
                <>
                  <td>{item.id}</td>
                  <td>
                    {editImageUrl && (
                      <img 
                        src={editImageUrl} 
                        alt={editName} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                    <input
                      type="text"
                      placeholder="URL фото"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      style={{ width: '100%', marginTop: '5px', fontSize: '11px' }}
                      maxLength="500"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength="100"
                      style={{ width: '120px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      step="0.01"
                      min="0.01"
                      max="1000000"
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>
                    <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                      {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editSize}
                      onChange={(e) => setEditSize(e.target.value)}
                      style={{ width: '50px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editMaterial}
                      onChange={(e) => setEditMaterial(e.target.value)}
                      maxLength="200"
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editCount}
                      onChange={(e) => setEditCount(e.target.value)}
                      min="0"
                      max="999999"
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      <option value="1">Активен</option>
                      <option value="0">Неактивен</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleUpdate(item.id)} style={{ marginRight: 5 }}>Сохранить</button>
                    <button onClick={cancelEdit}>Отмена</button>
                  </td>
                </>
              ) : (
                // Режим просмотра
                <>
                  <td>{item.id}</td>
                  <td>
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.price} ₽</td>
                  <td>{getTypeLabel(item.type)}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.material || '-'}</td>
                  <td>{item.count}</td>
                  <td style={getStatusStyle(item.status)}>{getStatusLabel(item.status)}</td>
                  <td>
                    <button onClick={() => startEdit(item)} style={{ marginRight: 5 }}>✏</button>
                    {item.status === 1 ? (
                      <button onClick={() => handleDeactivate(item.id)} style={{ marginRight: 5 }}>
                        🗑 Деактивировать
                      </button>
                    ) : (
                      <button onClick={() => handleHardDelete(item.id, item.name)} style={{ color: 'red' }}>
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