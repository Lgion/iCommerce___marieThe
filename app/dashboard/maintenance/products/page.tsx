'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/dashboard/DataTable';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  shop: {
    name: string;
  };
}

export default function ProductsMaintenancePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.title}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Produit supprimé avec succès');
        fetchProducts();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleView = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const columns = [
    {
      key: 'title',
      label: 'Nom du produit',
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="data-table__cell-user">
          <div>
            <div className="data-table__cell-primary">{value}</div>
            <div className="data-table__cell-secondary">{row.shop.name}</div>
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
      key: 'price',
      label: 'Prix',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span style={{ fontWeight: '600' }}>{formatCurrency(value)}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Gestion des produits
          </h1>
          <p style={{ color: 'var(--dashboardTextSecondary)', fontSize: '16px' }}>
            Créer, modifier et supprimer vos produits
          </p>
        </div>
        <button
          onClick={() => router.push('/products/new')}
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
          ➕ Nouveau produit
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable
      />
    </div>
  );
}
