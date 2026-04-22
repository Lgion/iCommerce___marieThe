'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import ProductActions from '@/components/ProductActions';
import ProductFormModal from '../components/ProductFormModal';
import { useGlobal } from '@/utils/GlobalProvider';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/cloudinaryDefaults';

import '@/assets/scss/components/productsPage/_productsPage.scss';

export type ProductDetailClientProps = {
  initialProduct: any;
  availableShops: { id: string; name: string }[];
};

export default function ProductDetailClient({ initialProduct, availableShops }: ProductDetailClientProps) {
  const router = useRouter();
  const {
    isAdmin,
    updateProduct,
    deleteProduct,
    syncProductCache,
    isProductMutating
  } = useGlobal();

  const [product, setProduct] = useState(initialProduct);
  const [showEditModal, setShowEditModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  const variationSummary = useMemo(() => {
    return (product?.variations || [])
      .filter((variation: any) => Boolean(variation?.name))
      .map((variation: any) => {
        const values = (variation.options || []).filter((option: any) => option?.value).map((option: any) => option.value);
        if (!values.length) {
          return variation.name;
        }
        return `${variation.name}: ${values.join(', ')}`;
      })
      .join(' • ');
  }, [product?.variations]);

  const handleDelete = async () => {
    const confirmation = window.confirm('Confirmez-vous la suppression de ce produit ?');
    if (!confirmation) return;
    try {
      await deleteProduct(product.id);
      setFeedbackMessage('Produit supprimé. Redirection en cours...');
      router.push('/products');
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Erreur lors de la suppression du produit.');
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
  };

  const handleSubmit = async (formValues: any) => {
    try {
      const updated = await updateProduct(product.id, formValues);
      syncProductCache(updated);
      setProduct(updated);
      setFeedbackMessage('Produit mis à jour avec succès.');
      closeModal();
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Erreur lors de la mise à jour du produit.');
    }
  };

  return (
    <article className="productDetail" itemScope itemType="https://schema.org/Product">
      <header className="productDetail__header">
        <button className="productDetail__back" type="button" onClick={() => router.back()}>
          Retour
        </button>
        <h1 className="productDetail__title" itemProp="name">
          {product?.title}
        </h1>
        {feedbackMessage ? (
          <p className="productDetail__feedback" role="status">
            {feedbackMessage}
          </p>
        ) : null}
      </header>

      <section className="productDetail__content">
        <div className="productDetail__visual">
          <Image
            src={product?.imageUrl || DEFAULT_PRODUCT_IMAGE}
            alt={product?.title || 'Produit'}
            className="productDetail__image"
            width={640}
            height={480}
            priority
          />
        </div>
        <div className="productDetail__info">
          <p className="productDetail__description" itemProp="description">
            {product?.description}
          </p>
          <div className="productDetail__meta">
            <span className="productDetail__price" itemProp="price" data-currency="XOF">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product?.price || 0)}
            </span>
            <meta itemProp="priceCurrency" content="EUR" />
            {product?.shop?.name ? (
              <span className="productDetail__shop">{product.shop.name}</span>
            ) : null}
          </div>
          {variationSummary ? (
            <aside className="productDetail__variations" aria-label="Variantes du produit">
              <h2 className="productDetail__variationsTitle">Variantes disponibles</h2>
              <p className="productDetail__variationsList">{variationSummary}</p>
            </aside>
          ) : null}
        </div>
      </section>

      {isAdmin ? (
        <footer className="productDetail__footer">
          <ProductActions
            variant="detail"
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDisabled={isProductMutating}
          />
        </footer>
      ) : null}

      {/* Modal réutilisée depuis la page principale via lazy import */}
      {showEditModal ? (
        <div className="productDetail__modal">
          <ProductFormModal
            isOpen={showEditModal}
            mode="update"
            initialData={product}
            availableShops={availableShops}
            isSubmitting={isProductMutating}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        </div>
      ) : null}
    </article>
  );
}
