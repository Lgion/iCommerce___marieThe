'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/dashboard/DataTable';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string;
  type: string;
  prixHoraire: number;
  category: {
    name: string;
  };
  _count?: {
    slots: number;
  };
}

export default function ServicesMaintenancePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    router.push(`/services/${service.id}/edit`);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${service.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Service supprimé avec succès');
        fetchServices();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleView = (service: Service) => {
    router.push(`/services/${service.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom du service',
      sortable: true,
      render: (value: string, row: Service) => (
        <div className="data-table__cell-user">
          <div>
            <div className="data-table__cell-primary">{value}</div>
            <div className="data-table__cell-secondary">
              {row.category.name} • {row.type}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      ),
    },
    {
      key: 'prixHoraire',
      label: 'Prix/heure',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ fontWeight: '600' }}>{formatCurrency(value)}</span>
      ),
    },
    {
      key: '_count',
      label: 'Créneaux',
      align: 'center' as const,
      render: (value: any) => (
        <span className="data-table__badge data-table__badge--info">
          {value?.slots || 0}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Chargement des services...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Gestion des services
          </h1>
          <p style={{ color: 'var(--dashboardTextSecondary)', fontSize: '16px' }}>
            Créer, modifier et supprimer vos services
          </p>
        </div>
        <button
          onClick={() => router.push('/services/new')}
          style={{
            padding: '12px 24px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ➕ Nouveau service
        </button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable
      />
    </div>
  );
}
