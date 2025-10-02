'use client';

import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  variant?: 'revenue' | 'bookings' | 'customers' | 'products' | 'services';
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  link?: {
    href: string;
    label: string;
  };
  subtitle?: string;
  size?: 'default' | 'compact' | 'large';
  bordered?: boolean;
}

export default function StatCard({
  label,
  value,
  icon,
  variant = 'revenue',
  trend,
  link,
  subtitle,
  size = 'default',
  bordered = false,
}: StatCardProps) {
  const sizeClass = size !== 'default' ? `stat-card--${size}` : '';
  const borderedClass = bordered ? 'stat-card--bordered' : '';
  const variantClass = variant ? `stat-card--${variant}` : '';

  return (
    <div className={`stat-card ${sizeClass} ${borderedClass} ${variantClass}`.trim()}>
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${variant}`}>{icon}</div>
      </div>

      <div className="stat-card__body">
        <div className="stat-card__label">{label}</div>
        <div className={`stat-card__value ${size !== 'default' ? `stat-card__value--${size}` : ''}`}>
          {value}
        </div>
        {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
      </div>

      {(trend || link) && (
        <div className="stat-card__footer">
          {trend && (
            <div className={`stat-card__trend stat-card__trend--${trend.direction}`}>
              <span className="stat-card__trend-icon">
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
              </span>
              <span className="stat-card__trend-value">{trend.value}%</span>
              <span className="stat-card__trend-label">{trend.label}</span>
            </div>
          )}
          {link && (
            <Link href={link.href} className="stat-card__link">
              {link.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
