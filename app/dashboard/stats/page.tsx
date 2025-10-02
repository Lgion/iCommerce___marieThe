'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';

interface Stats {
  revenue?: {
    current: number;
    previous: number;
    change: number;
  };
  orders?: {
    current: number;
    previous: number;
    change: number;
  };
  bookings?: {
    current: number;
    previous: number;
    change: number;
  };
  newCustomers?: {
    current: number;
    previous: number;
    change: number;
  };
  topProducts?: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
  topServices?: Array<{
    name: string;
    prixHoraire: number;
    bookings: number;
  }>;
}

export default function StatsOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats/overview');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getTrendDirection = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <p>Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Vue d'ensemble
        </h1>
        <p style={{ color: 'var(--dashboardTextSecondary)', fontSize: '16px' }}>
          Statistiques globales de votre activité
        </p>
      </div>

      {/* Statistiques principales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {stats.revenue && (
          <StatCard
            label="Chiffre d'affaires"
            value={formatCurrency(stats.revenue.current)}
            icon="💰"
            variant="revenue"
            trend={{
              value: Math.abs(Math.round(stats.revenue.change)),
              label: 'vs mois dernier',
              direction: getTrendDirection(stats.revenue.change),
            }}
            link={{
              href: '/dashboard/stats/products',
              label: 'Voir détails',
            }}
          />
        )}

        {stats.orders && (
          <StatCard
            label="Commandes"
            value={stats.orders.current}
            icon="📦"
            variant="products"
            trend={{
              value: Math.abs(Math.round(stats.orders.change)),
              label: 'vs mois dernier',
              direction: getTrendDirection(stats.orders.change),
            }}
            subtitle="Ce mois-ci"
          />
        )}

        {stats.bookings && (
          <StatCard
            label="Réservations"
            value={stats.bookings.current}
            icon="📅"
            variant="bookings"
            trend={{
              value: Math.abs(Math.round(stats.bookings.change)),
              label: 'vs mois dernier',
              direction: getTrendDirection(stats.bookings.change),
            }}
            link={{
              href: '/dashboard/stats/bookings',
              label: 'Voir détails',
            }}
          />
        )}

        {stats.newCustomers && (
          <StatCard
            label="Nouveaux clients"
            value={stats.newCustomers.current}
            icon="👥"
            variant="customers"
            trend={{
              value: Math.abs(Math.round(stats.newCustomers.change)),
              label: 'vs mois dernier',
              direction: getTrendDirection(stats.newCustomers.change),
            }}
            subtitle="Ce mois-ci"
          />
        )}
      </div>

      {/* Top produits et services */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}
      >
        {stats.topProducts && stats.topProducts.length > 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--dashboardBorderColor)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              📦 Top Produits
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.topProducts.map((product, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--gray-50)',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {product.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--dashboardTextSecondary)' }}>
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {product.quantity} vendus
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.topServices && stats.topServices.length > 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--dashboardBorderColor)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              ⚙️ Top Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.topServices.map((service, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--gray-50)',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {service.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--dashboardTextSecondary)' }}>
                      {formatCurrency(service.prixHoraire)}/h
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--statBookingsColor)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {service.bookings} réservations
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
