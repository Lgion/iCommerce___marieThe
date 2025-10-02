'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  submenu?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: 'Vue d\'ensemble',
    items: [
      { label: 'Accueil', href: '/dashboard', icon: '🏠' },
    ],
  },
  {
    title: 'Statistiques',
    items: [
      { label: 'Vue globale', href: '/dashboard/stats', icon: '📊' },
      { label: 'Services', href: '/dashboard/stats/services', icon: '⚙️' },
      { label: 'Produits', href: '/dashboard/stats/products', icon: '📦' },
      { label: 'Réservations', href: '/dashboard/stats/bookings', icon: '📅' },
      { label: 'Clients', href: '/dashboard/stats/customers', icon: '👥' },
      { label: 'Boutiques', href: '/dashboard/stats/shops', icon: '🏪' },
    ],
  },
  {
    title: 'Maintenance',
    items: [
      { label: 'Produits', href: '/dashboard/maintenance/products', icon: '📦' },
      { label: 'Services', href: '/dashboard/maintenance/services', icon: '⚙️' },
      { label: 'Créneaux', href: '/dashboard/maintenance/slots', icon: '🕐' },
      { label: 'Promotions', href: '/dashboard/maintenance/promotions', icon: '🎁' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Clients', href: '/dashboard/crm/customers', icon: '👤' },
      { label: 'Campagnes', href: '/dashboard/crm/campaigns', icon: '📧' },
      { label: 'Boutiques', href: '/dashboard/crm/shops', icon: '🏪' },
      { label: 'Analytics', href: '/dashboard/crm/analytics', icon: '📈' },
    ],
  },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="dashboard-nav">
      <div className="dashboard-nav__header">
        <Link href="/dashboard" className="dashboard-nav__logo">
          <div className="dashboard-nav__logo-icon">🛍️</div>
          <span>iCommerce</span>
        </Link>
      </div>

      <div className="dashboard-nav__sections">
        {navigationSections.map((section) => (
          <div key={section.title} className="dashboard-nav__section">
            <div className="dashboard-nav__section-title">{section.title}</div>
            <ul className="dashboard-nav__section-items">
              {section.items.map((item) => (
                <li key={item.label}>
                  {item.submenu ? (
                    <>
                      <div
                        className={`dashboard-nav__item ${
                          isActive(item.href) ? 'dashboard-nav__item--active' : ''
                        }`}
                        onClick={() => toggleSubmenu(item.label)}
                      >
                        <span className="dashboard-nav__item-icon">{item.icon}</span>
                        <span className="dashboard-nav__item-text">{item.label}</span>
                        {item.badge && (
                          <span className="dashboard-nav__item-badge">{item.badge}</span>
                        )}
                        <span
                          className={`dashboard-nav__item-arrow ${
                            expandedItems.includes(item.label)
                              ? 'dashboard-nav__item-arrow--expanded'
                              : ''
                          }`}
                        >
                          ▶
                        </span>
                      </div>
                      <ul
                        className={`dashboard-nav__submenu ${
                          expandedItems.includes(item.label)
                            ? 'dashboard-nav__submenu--expanded'
                            : ''
                        }`}
                      >
                        {item.submenu.map((subitem) => (
                          <li key={subitem.label}>
                            <Link
                              href={subitem.href}
                              className={`dashboard-nav__item ${
                                isActive(subitem.href) ? 'dashboard-nav__item--active' : ''
                              }`}
                            >
                              <span className="dashboard-nav__item-icon">{subitem.icon}</span>
                              <span className="dashboard-nav__item-text">{subitem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`dashboard-nav__item ${
                        isActive(item.href) ? 'dashboard-nav__item--active' : ''
                      }`}
                    >
                      <span className="dashboard-nav__item-icon">{item.icon}</span>
                      <span className="dashboard-nav__item-text">{item.label}</span>
                      {item.badge && (
                        <span className="dashboard-nav__item-badge">{item.badge}</span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="dashboard-nav__footer">
        <div className="dashboard-nav__version">v1.0.0</div>
      </div>
    </nav>
  );
}
