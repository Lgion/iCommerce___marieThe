'use client';

import { useState } from 'react';

interface ActivityLogItem {
  id: string;
  action: string;
  description: string;
  user?: string;
  entityType?: string;
  entityId?: string;
  time: string;
  icon: string;
  iconVariant: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view';
  details?: string;
}

interface ActivityLogProps {
  items: ActivityLogItem[];
  title?: string;
  variant?: 'default' | 'timeline';
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ActivityLog({
  items,
  title = 'Historique des connexions',
  variant = 'default',
  onLoadMore,
  hasMore = false,
}: ActivityLogProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const toggleDetails = (id: string) => {
    setShowDetails(showDetails === id ? null : id);
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`activity-log ${variant === 'timeline' ? 'activity-log--timeline' : ''}`}>
      <div className="activity-log__header">
        <h3 className="activity-log__title">{title}</h3>
        <button className="activity-log__filter">Filtrer</button>
      </div>

      {items.length === 0 ? (
        <div className="activity-log__empty">
          <div className="activity-log__empty-icon">📋</div>
          <div className="activity-log__empty-text">Aucune activité récente</div>
        </div>
      ) : (
        <>
          <ul className="activity-log__list">
            {items.map((item) => (
              <li key={item.id} className="activity-log__item">
                <div className={`activity-log__icon activity-log__icon--${item.iconVariant}`}>
                  {item.icon}
                </div>
                <div className="activity-log__content">
                  <div className="activity-log__header-row">
                    <div className="activity-log__action">{item.action}</div>
                    <div className="activity-log__time">{formatTime(item.time)}</div>
                  </div>
                  <div className="activity-log__description">
                    {item.description}
                    {item.user && (
                      <span className="activity-log__user"> par {item.user}</span>
                    )}
                    {item.entityType && (
                      <span className="activity-log__entity"> {item.entityType}</span>
                    )}
                  </div>
                  {item.details && (
                    <>
                      <button
                        onClick={() => toggleDetails(item.id)}
                        style={{
                          fontSize: '12px',
                          color: 'var(--primary-color)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginTop: '8px',
                        }}
                      >
                        {showDetails === item.id ? 'Masquer' : 'Voir'} les détails
                      </button>
                      {showDetails === item.id && (
                        <div className="activity-log__details">{item.details}</div>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {hasMore && onLoadMore && (
            <div className="activity-log__footer">
              <button onClick={onLoadMore} className="activity-log__load-more">
                Charger plus
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
