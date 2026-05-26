import React from 'react'

export const Pagination = ({ page, totalPages, totalElements, onPageChange, label = 'записей' }) => {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="btn-secondary"
      >
        Назад
      </button>
      <span className="pagination-info">
        Страница <strong>{page + 1}</strong> из {totalPages}
        {totalElements !== undefined && (
          <span style={{ color: '#94a3b8', marginLeft: 4 }}>
            (всего {totalElements} {label})
          </span>
        )}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="btn-secondary"
      >
        Вперёд
      </button>
    </div>
  )
}