'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductFormModal from '@/app/products/components/ProductFormModal';
import { useGlobal } from '@/utils/GlobalProvider';

const defaultModalState = {
  isOpen: false,
  mode: 'create',
  product: null
};

export default function ProductsBlock(props = {}) {
  const {
    showCartButton = true,
    cartHref = '/cart'
  } = props;
  const router = useRouter();
  const {
    isAdmin,
    products,
    productsLoaded,
    productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    isProductMutating,
    shops,
    shopsLoaded,
    shopsLoading,
    loadShops,
    addProductToCart,
    cartTotals
  } = useGlobal();

  const [modalState, setModalState] = useState(defaultModalState);
  const [feedbackMessage, setFeedbackMessage] = useState(() => null);
  const [isCartShaking, setIsCartShaking] = useState(false);
  const cartShakeTimeoutRef = useRef(null);

  const cartQuantity = cartTotals?.totalQuantity ?? 0;

  const clearCartShakeTimeout = () => {
    if (cartShakeTimeoutRef.current) {
      clearTimeout(cartShakeTimeoutRef.current);
      cartShakeTimeoutRef.current = null;
    }
  };

  const triggerCartShake = () => {
    setIsCartShaking(true);
    clearCartShakeTimeout();
    cartShakeTimeoutRef.current = setTimeout(() => {
      setIsCartShaking(false);
      cartShakeTimeoutRef.current = null;
    }, 600);
  };

  useEffect(() => {
    if (!shopsLoaded) {
      loadShops();
    }
  }, [loadShops, shopsLoaded]);
  useEffect(() => {
    if (modalState.isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [modalState.isOpen]);

  useEffect(() => () => {
    clearCartShakeTimeout();
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.title.localeCompare(b.title));
  }, [products]);

  const availableShops = useMemo(() => {
    return [...(shops || [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [shops]);

  const hasAvailableShops = availableShops.length > 0;
  const showShopWarning = !shopsLoading && !hasAvailableShops;

  const handleAddProductToCart = (product) => {
    if (!product?.id) {
      return;
    }

    try {
      addProductToCart({
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        shopId: product.shop?.id || null,
        metadata: {
          description: product.description,
          digitalFile: product.digitalFile,
          variations: product.variations
        }
      });
      const nextQuantity = cartTotals.totalQuantity + 1;
      const quantityLabel = nextQuantity > 1 ? `${nextQuantity} articles` : `${nextQuantity} article`;
      const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(product.price ?? 0);
      setFeedbackMessage(`"${product.title}" ajouté au panier (${formattedPrice} • ${quantityLabel}).`);
      triggerCartShake();
    } catch (error) {
      setFeedbackMessage(error?.message || 'Impossible d\'ajouter ce produit au panier.');
    }
  };

  const closeModal = () => {
    setModalState((previous) => ({ ...previous, isOpen: false }));
  };

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: 'create', product: null });
  };

  const openUpdateModal = (product) => {
    setModalState({ isOpen: true, mode: 'update', product });
  };

  const handleNavigate = (productId) => {
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        router.push(`/products/${productId}`);
      });
      return;
    }
    router.push(`/products/${productId}`);
  };

  const handleSubmit = async (formValues) => {
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
    } catch (error) {
      setFeedbackMessage(error?.message || 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const handleDelete = async (productId) => {
    const confirmation = window.confirm('Confirmez-vous la suppression de ce produit ?');
    if (!confirmation) return;

    try {
      setFeedbackMessage(null);
      await deleteProduct(productId);
      setFeedbackMessage('Produit supprimé avec succès.');
    } catch (error) {
      setFeedbackMessage(error?.message || 'Une erreur est survenue lors de la suppression.');
    }
  };

  if (productsLoading && !productsLoaded) {
    return <div className="productsPage productsPage--loading">Chargement des produits...</div>;
  }

  const isFabDisabled = isProductMutating;

  return (
    <main className={`productsPage${productsLoading ? ' is-loading' : ''}`}>
      
      <header className="productsPage__header">
        <div className="productsPage__headerContent">
          <h2 className="productsPage__title">Nos Produits</h2>
          {feedbackMessage ? (
            <p className="productsPage__feedback" role="status">
              {feedbackMessage}
            </p>
          ) : null}
        </div>
        {shopsLoading && (
          <p className="productsPage__feedback" role="status">
            Chargement des boutiques...
          </p>
        )}
        {showShopWarning && (
          <p className="productsPage__feedback productsPage__feedback--warning" role="alert">
            Aucune boutique n'est disponible. Créez une boutique pour pouvoir publier un produit.
          </p>
        )}
      </header>

      {sortedProducts.length === 0 ? (
        <section className="productsPage__empty" aria-live="polite">
          <p className="productsPage__emptyText">
            Aucun produit n'est disponible pour le moment.
          </p>
          {isAdmin ? (
            <button
              type="button"
              className="productsPage__emptyAction"
              onClick={openCreateModal}
              disabled={isProductMutating}
            >
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
              onAddToCart={() => handleAddProductToCart(product)}
            />
          ))}
        </ul>
      )}

      <div className="productsPage__controls" role="group" aria-label="Actions produits">
        {showCartButton ? (
          <Link
            href={cartHref}
            className={`productsPage__cart${isCartShaking ? ' productsPage__cart--shake' : ''}`}
            title="Ouvrir le panier"
            aria-label={`Ouvrir le panier (${cartQuantity} article${cartQuantity > 1 ? 's' : ''})`}
          >
            <span className="productsPage__cartIcon" aria-hidden="true">🛒</span>
            <span className="productsPage__cartBadge" aria-live="polite">{cartQuantity}</span>
          </Link>
        ) : null}

        {isAdmin ? (
          <button
            type="button"
            className="productsPage__fab"
            onClick={openCreateModal}
            aria-label="Ajouter un nouveau produit"
            disabled={isFabDisabled}
          >
            <span aria-hidden="true">＋</span>
          </button>
        ) : null}
      </div>

      <ProductFormModal
        isOpen={modalState.isOpen && isAdmin}
        mode={modalState.mode}
        initialData={modalState.product}
        availableShops={availableShops}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isProductMutating}
        hasAvailableShops={hasAvailableShops}
        showShopWarning={showShopWarning}
      />
    </main>
  );
}
