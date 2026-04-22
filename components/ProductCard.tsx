'use client';

import Image from 'next/image';
import { memo, useMemo } from 'react';

import ProductActions from '@/components/ProductActions';
// import { DEFAULT_PRODUCT_IMAGE } from '@/lib/cloudinaryDefaults';

type VariationOption = {
  id: string;
  value: string;
};

type Variation = {
  id: string;
  name: string;
  options?: VariationOption[];
};

export type ProductCardProps = {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string | null;
    digitalFile?: string | null;
    variations?: Variation[];
    shop?: {
      id: string;
      name: string;
    } | null;
  };
  isAdmin?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCart?: () => void;
  addToCartLabel?: string;
  addToCartDisabled?: boolean;
};

function formatPrice(price?: number) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '—';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(price);
}

function buildVariationSummary(variations?: Variation[]): string {
  if (!variations || variations.length === 0) {
    return '';
  }
  return variations
    .filter((variation) => variation.name?.length)
    .map((variation) => {
      const options = variation.options?.filter((option) => option.value?.length).map((option) => option.value);
      const suffix = options && options.length ? `: ${options.join(', ')}` : '';
      return `${variation.name}${suffix}`;
    })
    .join(' • ');
}

const ProductCard = memo(function ProductCard({
  product,
  isAdmin = false,
  onSelect,
  onEdit,
  onDelete,
  onAddToCart,
  addToCartLabel = 'Ajouter au panier',
  addToCartDisabled = false
}: ProductCardProps) {
  const priceLabel = useMemo(() => formatPrice(product?.price), [product?.price]);
  const variationSummary = useMemo(() => buildVariationSummary(product?.variations), [product?.variations]);

  const handleCardInteraction = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  const DEFAULT_PRODUCT_IMAGE = "https://res.cloudinary.com/dfpxi9ywm/image/upload/v1759392722/product_default_glgnzg.jpg"
  const imageSrc = product?.imageUrl || DEFAULT_PRODUCT_IMAGE;
  const imageAlt = product?.title ? `${product.title} visuel produit` : 'Visuel produit';

  return (
    <li className={`productCard${onSelect ? ' productCard--interactive' : ''}${isAdmin ? ' productCard--admin' : ''}`}>
      <article
        className="productCard__surface"
        itemScope
        itemType="https://schema.org/Product"
      >
        <header
          className="productCard__media"
          onClick={handleCardInteraction}
          onKeyDown={handleKeyDown}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          aria-label={onSelect ? `Voir le produit ${product?.title}` : undefined}
        >
          <figure className="productCard__image" itemProp="image">
            <Image src={imageSrc} alt={imageAlt} width={480} height={320} loading="lazy" />
          </figure>
          <div className="productCard__caption" itemProp="brand">
            {product?.shop?.name || 'Artisanat Local'}
          </div>
          {isAdmin && (onEdit || onDelete) ? (
            <ProductActions
              variant="overlay"
              onEdit={() => onEdit?.()}
              onDelete={() => onDelete?.()}
            />
          ) : null}
        </header>

        <section className="productCard__content">
          <h3 className="productCard__title" itemProp="name">
            {product?.title}
          </h3>
          <p className="productCard__description" itemProp="description">
            {product?.description}
          </p>

          {variationSummary ? (
            <div className="productCard__variations" aria-label="Variations disponibles">
              <span className="productCard__variationsLabel">Variantes</span>
              <p className="productCard__variationsList">{variationSummary}</p>
            </div>
          ) : null}
        </section>

        <footer className="productCard__footer">
          <div className="productCard__pricing" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span className="productCard__price" itemProp="price" data-currency="F CFA">
              {priceLabel}
            </span>
            <meta itemProp="priceCurrency" content="CFA" />
          </div>

          <div className="productCard__actions" role="group" aria-label={`Actions pour ${product?.title}`}>
            <button
              type="button"
              className="productCard__actionsButton productCard__actionsButton--primary"
              onClick={() => onAddToCart?.()}
              disabled={addToCartDisabled}
              aria-label={addToCartLabel || 'Ajouter ce produit au panier'}
            >
              {addToCartLabel}
            </button>

            <button
              type="button"
              className="productCard__actionsButton productCard__actionsButton--secondary"
              onClick={handleCardInteraction}
              aria-label={`Voir la fiche ${product?.title}`}
            >
              Voir le produit
            </button>
          </div>

          {isAdmin && (onEdit || onDelete) ? (
            <ProductActions
              variant="footer"
              onEdit={() => onEdit?.()}
              onDelete={() => onDelete?.()}
            />
          ) : null}
        </footer>
      </article>
    </li>
  );
});

export default ProductCard;
