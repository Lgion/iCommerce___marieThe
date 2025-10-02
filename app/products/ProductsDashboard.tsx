'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/utils/GlobalProvider';
import ProductCard from '@/components/ProductCard';
import ProductFormModal from './components/ProductFormModal';

import '@/assets/scss/components/productsPage/_productsPage.scss';

export type ProductsDashboardProps = {
  initialProducts?: any[];
  availableShops: { id: string; name: string }[];
};

export default function ProductsDashboard({ initialProducts = [], availableShops }: ProductsDashboardProps) {
  const router = useRouter();
  const {
    isAdmin,
    products,
    productsLoaded,
    productsLoading,
    loadProducts,
    hydrateProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isProductMutating
  } = useGlobal();

  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'create' | 'update'; product: any | null }>({
    isOpen: false,
    mode: 'create',
    product: null
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.title.localeCompare(b.title));
  }, [products]);

  useEffect(() => {
    if (!productsLoaded) {
      if (initialProducts.length > 0) {
        hydrateProducts(initialProducts);
      } else {
        loadProducts();
      }
    }
  }, [hydrateProducts, initialProducts, loadProducts, productsLoaded]);

  const closeModal = () => {
    setModalState((previous) => ({ ...previous, isOpen: false }));
  };

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: 'create', product: null });
  };

  const openUpdateModal = (product: any) => {
    setModalState({ isOpen: true, mode: 'update', product });
  };

  const handleNavigate = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleSubmit = async (formValues: any) => {
    try {
      setFeedbackMessage(null);
      if (modalState.mode === 'create') {
        await createProduct(formValues);
        setFeedbackMessage('Produit créé avec succès.');
      } else if (modalState.product) {
        await updateProduct(modalState.product.id, formValues);
        setFeedbackMessage('Produit mis à jour avec succès.');
      }
      closeModal();
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const handleDelete = async (productId: string) => {
    const confirmation = window.confirm('Confirmez-vous la suppression de ce produit ?');
    if (!confirmation) return;

    try {
      setFeedbackMessage(null);
      await deleteProduct(productId);
      setFeedbackMessage('Produit supprimé avec succès.');
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Une erreur est survenue lors de la suppression.');
    }
  };

  return (
    <main className={`productsPage${productsLoading ? ' is-loading' : ''}`}>
      <header className="productsPage__header">
        <div className="productsPage__headerContent">
          <h1 className="productsPage__title">Nos Produits</h1>
          {feedbackMessage ? (
            <p className="productsPage__feedback" role="status">
              {feedbackMessage}
            </p>
          ) : null}
        </div>
      </header>

      {sortedProducts.length === 0 ? (
        <section className="productsPage__empty" aria-live="polite">
          <p className="productsPage__emptyText">
            Aucun produit n'est disponible pour le moment.
          </p>
          {isAdmin ? (
            <button type="button" className="productsPage__emptyAction" onClick={openCreateModal}>
              Ajouter un premier produit
            </button>
          ) : null}
        </section>
      ) : (
        <ul className="productsPage__grid" role="list">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={isAdmin}
              onSelect={() => handleNavigate(product.id)}
              onEdit={() => openUpdateModal(product)}
              onDelete={() => handleDelete(product.id)}
            />
          ))}
        </ul>
      )}

      {isAdmin ? (
        <button
          type="button"
          className="productsPage__fab"
          onClick={openCreateModal}
          aria-label="Ajouter un nouveau produit"
        >
          <span aria-hidden="true">＋</span>
        </button>
      ) : null}

      <ProductFormModal
        isOpen={modalState.isOpen && isAdmin}
        mode={modalState.mode}
        initialData={modalState.product}
        availableShops={availableShops}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isProductMutating}
      />
    </main>
  );
}
