'use client';

import { useState } from 'react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export default function DataTable<T extends { id: string }>({
  title,
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = false,
  pagination,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredData = getSortedData().filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="data-table">
      {(title || searchable || filterable) && (
        <div className="data-table__header">
          {title && <h3 className="data-table__title">{title}</h3>}
          <div className="data-table__actions">
            {searchable && (
              <div className="data-table__search">
                <span className="data-table__search-icon">🔍</span>
                <input
                  type="text"
                  className="data-table__search-input"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {filterable && (
              <select className="data-table__filter">
                <option>Tous</option>
              </select>
            )}
          </div>
        </div>
      )}

      <div className="data-table__container">
        <table className="data-table__table">
          <thead className="data-table__thead">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`data-table__th ${
                    column.sortable ? 'data-table__th--sortable' : ''
                  } ${
                    sortConfig?.key === column.key ? 'data-table__th--sorted' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.label}
                  {column.sortable && sortConfig?.key === column.key && (
                    <span className="data-table__sort-icon">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="data-table__th data-table__th--actions">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="data-table__tbody">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="data-table__td">
                  <div className="data-table__empty">
                    <div className="data-table__empty-icon">📭</div>
                    <div className="data-table__empty-text">Aucune donnée disponible</div>
                    <div className="data-table__empty-subtext">
                      {searchQuery
                        ? 'Essayez de modifier votre recherche'
                        : 'Les données apparaîtront ici'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="data-table__td"
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render
                        ? column.render((row as any)[column.key], row)
                        : String((row as any)[column.key] || '-')}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="data-table__td data-table__td--actions">
                      <div className="data-table__actions-menu">
                        {onView && (
                          <button
                            className="data-table__action-btn data-table__action-btn--view"
                            onClick={() => onView(row)}
                            title="Voir"
                          >
                            👁️
                          </button>
                        )}
                        {onEdit && (
                          <button
                            className="data-table__action-btn data-table__action-btn--edit"
                            onClick={() => onEdit(row)}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="data-table__action-btn data-table__action-btn--delete"
                            onClick={() => onDelete(row)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="data-table__footer">
          <div className="data-table__info">
            Affichage de {(pagination.currentPage - 1) * pagination.pageSize + 1} à{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} sur{' '}
            {pagination.totalItems} résultats
          </div>
          <div className="data-table__pagination">
            <button
              className={`data-table__page-btn ${
                pagination.currentPage === 1 ? 'data-table__page-btn--disabled' : ''
              }`}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              ←
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const current = pagination.currentPage;
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= current - 1 && page <= current + 1)
                );
              })
              .map((page, index, array) => (
                <span key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                  <button
                    className={`data-table__page-btn ${
                      pagination.currentPage === page ? 'data-table__page-btn--active' : ''
                    }`}
                    onClick={() => pagination.onPageChange(page)}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              className={`data-table__page-btn ${
                pagination.currentPage === pagination.totalPages
                  ? 'data-table__page-btn--disabled'
                  : ''
              }`}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
