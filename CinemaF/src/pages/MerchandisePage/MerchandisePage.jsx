import React, { useEffect, useState } from 'react'
import { MerchandiseApi } from '../../services/MerchandiseApi'
import './MerchandisePage.css'

export const MerchandisePage = () => {
  const [merchandise, setMerchandise] = useState([])
  const [filteredMerchandise, setFilteredMerchandise] = useState([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  const [searchName, setSearchName] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState('')
  const [size, setSize] = useState('')
  const [material, setMaterial] = useState('')
  const [count, setCount] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editType, setEditType] = useState('')
  const [editSize, setEditSize] = useState('')
  const [editMaterial, setEditMaterial] = useState('')
  const [editCount, setEditCount] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editStatus, setEditStatus] = useState('')

  const types = [
    { value: 'Футболка', label: 'Футболка' },
    { value: 'Кружка', label: 'Кружка' },
    { value: 'Игрушка', label: 'Игрушка' },
    { value: 'Брелок', label: 'Брелок' },
    { value: 'Прочее', label: 'Прочее' }
  ]

  const sizes = [
    { value: '', label: 'Все' },
    { value: '42', label: '42' },
    { value: '44', label: '44' },
    { value: '46', label: '46' },
    { value: '48', label: '48' },
    { value: '50', label: '50' }
  ]

  const statuses = [
    { value: '', label: 'Все' },
    { value: '1', label: 'Активен' },
    { value: '0', label: 'Неактивен' }
  ]

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

  const handleSearch = (e) => setSearchName(e.target.value)
  const handleFilterType = (e) => setFilterType(e.target.value)
  const handleFilterSize = (e) => setFilterSize(e.target.value)
  const handleFilterStatus = (e) => setFilterStatus(e.target.value)

  const clearFilters = () => {
    setSearchName('')
    setFilterType('')
    setFilterSize('')
    setFilterStatus('')
  }

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

  const cancelEdit = () => setEditingId(null)

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

  const getTypeLabel = (typeValue) => {
    const found = types.find(t => t.value === typeValue)
    return found ? found.label : typeValue
  }

  const getStatusLabel = (status) => status === 1 ? 'Активен' : 'Неактивен'

  useEffect(() => {
    loadMerchandise()
  }, [page])

  if (loading) {
    return (
      <div className="merch-page">
        <div className="merch-page__loading">
          <div className="merch-page__spinner" />
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="merch-page">
      <h1 className="merch-page__header">Мерчендайз</h1>

      <div className="merch-page__card">
        <h3 className="merch-page__card-title">Поиск и фильтрация</h3>
        <div className="merch-page__filter-row">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchName}
            onChange={handleSearch}
            className="merch-page__input merch-page__w-200"
          />
          <select value={filterType} onChange={handleFilterType} className="merch-page__select">
            <option value="">Все типы</option>
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select value={filterSize} onChange={handleFilterSize} className="merch-page__select">
            {sizes.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={handleFilterStatus} className="merch-page__select">
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button onClick={clearFilters} className="merch-page__btn-secondary">Сбросить</button>
        </div>
      </div>

      <div className="merch-page__card">
        <h3 className="merch-page__card-title">Добавить товар</h3>
        <form onSubmit={handleCreate}>
          <div className="merch-page__form-row">
            <div className="merch-page__form-field">
              <label className="merch-page__label">Название</label>
              <input
                type="text"
                placeholder="Введите название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="merch-page__input merch-page__w-180"
                maxLength="100"
              />
              <span className="merch-page__helper">2-100 символов</span>
            </div>
            <div className="merch-page__form-field">
              <label className="merch-page__label">Цена (руб.)</label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="merch-page__input merch-page__w-120"
                step="0.01"
                min="0.01"
                max="1000000"
              />
              <span className="merch-page__helper">0.01 — 1 000 000</span>
            </div>
            <div className="merch-page__form-field">
              <label className="merch-page__label">Тип</label>
              <select value={type} onChange={(e) => setType(e.target.value)} required className="merch-page__select">
                <option value="">Выберите тип</option>
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="merch-page__form-field">
              <label className="merch-page__label">Размер</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="merch-page__select">
                <option value="">Не указан</option>
                {sizes.slice(1).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span className="merch-page__helper">0-100</span>
            </div>
            <div className="merch-page__form-field">
              <label className="merch-page__label">Материал</label>
              <input
                type="text"
                placeholder="Материал"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="merch-page__input merch-page__w-140"
                maxLength="200"
              />
            </div>
            <div className="merch-page__form-field">
              <label className="merch-page__label">Количество</label>
              <input
                type="number"
                placeholder="0"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
                className="merch-page__input merch-page__w-100"
                min="0"
                max="999999"
              />
            </div>
            <div className="merch-page__form-field">
              <label className="merch-page__label">URL изображения</label>
              <input
                type="text"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="merch-page__input merch-page__w-200"
                maxLength="500"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="merch-page__btn">Добавить</button>
            </div>
          </div>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="merch-page__table">
          <thead>
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
            {filteredMerchandise.length === 0 ? (
              <tr>
                <td colSpan="10" className="merch-page__empty">
                  {searchName || filterType || filterSize || filterStatus
                    ? 'По вашему запросу ничего не найдено'
                    : 'Список товаров пуст. Добавьте первый товар выше!'}
                </td>
              </tr>
            ) : (
              filteredMerchandise.map((item) => (
                <tr key={item.id} className={item.status === 0 ? 'merch-page__row-inactive' : ''}>
                  {editingId === item.id ? (
                    <>
                      <td className="merch-page__table-cell">{item.id}</td>
                      <td className="merch-page__table-cell">
                        {editImageUrl && (
                          <img 
                            src={editImageUrl} 
                            alt={editName} 
                            className="merch-page__img-thumb"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <input
                          type="text"
                          placeholder="URL фото"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          className="merch-page__input merch-page__w-full"
                          style={{ marginTop: 5, fontSize: 11 }}
                          maxLength="500"
                        />
                      </td>
                      <td className="merch-page__table-cell">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="merch-page__input merch-page__w-120"
                          maxLength="100"
                        />
                      </td>
                      <td className="merch-page__table-cell">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="merch-page__input merch-page__w-100"
                          step="0.01"
                          min="0.01"
                          max="1000000"
                        />
                      </td>
                      <td className="merch-page__table-cell">
                        <select value={editType} onChange={(e) => setEditType(e.target.value)} className="merch-page__select">
                          {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="merch-page__table-cell">
                        <input
                          type="text"
                          value={editSize}
                          onChange={(e) => setEditSize(e.target.value)}
                          className="merch-page__input merch-page__w-60"
                        />
                      </td>
                      <td className="merch-page__table-cell">
                        <input
                          type="text"
                          value={editMaterial}
                          onChange={(e) => setEditMaterial(e.target.value)}
                          className="merch-page__input merch-page__w-100"
                          maxLength="200"
                        />
                      </td>
                      <td className="merch-page__table-cell">
                        <input
                          type="number"
                          value={editCount}
                          onChange={(e) => setEditCount(e.target.value)}
                          className="merch-page__input merch-page__w-70"
                          min="0"
                          max="999999"
                        />
                      </td>
                      <td className="merch-page__table-cell">
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="merch-page__select">
                          <option value="1">Активен</option>
                          <option value="0">Неактивен</option>
                        </select>
                      </td>
                      <td className="merch-page__table-cell">
                        <div className="merch-page__btn-group">
                          <button onClick={() => handleUpdate(item.id)} className="merch-page__btn-success">Сохранить</button>
                          <button onClick={cancelEdit} className="merch-page__btn-secondary">Отмена</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="merch-page__table-cell">{item.id}</td>
                      <td className="merch-page__table-cell">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="merch-page__img-thumb"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                      </td>
                      <td className="merch-page__table-cell merch-page__table-cell--name">{item.name}</td>
                      <td className="merch-page__table-cell">{item.price.toLocaleString('ru-RU')} руб.</td>
                      <td className="merch-page__table-cell">{getTypeLabel(item.type)}</td>
                      <td className="merch-page__table-cell">{item.size || '-'}</td>
                      <td className="merch-page__table-cell">{item.material || '-'}</td>
                      <td className="merch-page__table-cell">{item.count}</td>
                      <td className="merch-page__table-cell">
                        <span className={`merch-page__badge ${item.status === 1 ? 'merch-page__badge--success' : 'merch-page__badge--danger'}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="merch-page__table-cell">
                        <div className="merch-page__btn-group">
                          <button onClick={() => startEdit(item)} className="merch-page__btn-secondary">Редактировать</button>
                          {item.status === 1 ? (
                            <button onClick={() => handleDeactivate(item.id)} className="merch-page__btn-danger">Деактивировать</button>
                          ) : (
                            <button onClick={() => handleHardDelete(item.id, item.name)} className="merch-page__btn-danger">Удалить</button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="merch-page__pagination">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))} 
            disabled={page === 0}
            className="merch-page__btn-secondary"
          >
            Назад
          </button>
          <span className="merch-page__pagination-info">
            Страница <strong>{page + 1}</strong> из {totalPages} 
            <span style={{ color: '#94a3b8', marginLeft: 4 }}>(всего {totalElements} товаров)</span>
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
            disabled={page >= totalPages - 1}
            className="merch-page__btn-secondary"
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  )
}