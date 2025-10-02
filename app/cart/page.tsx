'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useGlobal } from '@/utils/GlobalProvider';

import '@/assets/scss/components/cart/_cartPage.scss';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

type CartItem = {
  id: string;
  type: string;
  title?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  metadata?: Record<string, any> | null;
  referenceId?: string;
};

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

const formatCurrency = (value: number | undefined): string => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return currencyFormatter.format(safeValue);
};

const isProductItem = (item: CartItem) => item.type === 'product';
const isReservationItem = (item: CartItem) => item.type === 'reservation';

const getReservationLabels = (item: CartItem) => {
  const metadata = item?.metadata || {};
  const dateLabel: string | undefined = metadata.dateLabel;
  const startLabel: string | undefined = metadata.startLabel;
  const endLabel: string | undefined = metadata.endLabel;
  const durationLabel: string | undefined = metadata.durationLabel;

  if (dateLabel && startLabel && endLabel) {
    return `${dateLabel} · ${startLabel} → ${endLabel}${durationLabel ? ` · ${durationLabel}` : ''}`;
  }

  return null;
};

export default function CartPage() {
  const router = useRouter();
  const {
    cartState,
    cartTotals,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
  } = useGlobal();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const cartItems = useMemo(() => cartState?.items ?? [], [cartState]);
  const isCartEmpty = cartItems.length === 0;

  const subtotalLabel = useMemo(() => formatCurrency(cartTotals?.subtotal ?? 0), [cartTotals?.subtotal]);
  const totalQuantityLabel = useMemo(() => {
    const quantity = cartTotals?.totalQuantity ?? 0;
    if (quantity <= 0) {
      return 'Aucun article';
    }
    return quantity > 1 ? `${quantity} articles` : `${quantity} article`;
  }, [cartTotals?.totalQuantity]);

  const triggerNavigation = useCallback((href: string) => {
    if (!href) return;

    const startNavigation = () => {
      router.push(href);
    };

    if (typeof document !== 'undefined') {
      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(startNavigation);
        return;
      }
    }

    startNavigation();
  }, [router]);

  const handleQuantityChange = useCallback((itemId: string, nextQuantity: number) => {
    if (!itemId) return;

    const normalized = Math.max(1, Number.parseInt(String(nextQuantity), 10) || 1);

    try {
      updateCartItemQuantity(itemId, normalized);
      setFeedbackMessage(`Quantité mise à jour (${normalized}).`);
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Impossible de mettre à jour la quantité.');
    }
  }, [updateCartItemQuantity]);

  const handleRemove = useCallback((itemId: string) => {
    if (!itemId) return;

    try {
      removeCartItem(itemId);
      setFeedbackMessage('Article retiré du panier.');
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Impossible de retirer cet article.');
    }
  }, [removeCartItem]);

  const handleClearCart = useCallback(() => {
    if (!window.confirm('Voulez-vous vider votre panier ?')) {
      return;
    }

    try {
      clearCart();
      setFeedbackMessage('Panier vidé.');
    } catch (error: any) {
      setFeedbackMessage(error?.message || 'Impossible de vider le panier.');
    }
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    setFeedbackMessage('Le passage en caisse sera disponible prochainement.');
  }, []);

  return (
    <main
      className="cartPage"
      itemScope
      itemType="https://schema.org/ShoppingCart"
      aria-labelledby="cartPageTitle"
    >
      <header className="cartPage__header">
        <div className="cartPage__summary" role="status" aria-live="polite">
          <span>{totalQuantityLabel}</span>
          <span>•</span>
          <span>Sous-total&nbsp;: {subtotalLabel}</span>
        </div>
        <h1 id="cartPageTitle" className="cartPage__title">
          Mon panier
        </h1>
        {feedbackMessage ? (
          <p className="cartPage__summary" role="status" aria-live="assertive">
            {feedbackMessage}
          </p>
        ) : null}
      </header>

      <section className="cartPage__layout">
        <div className="cartPage__list" role="list">
          {isCartEmpty ? (
            <div className="cartPage__empty" role="status" aria-live="polite">
              <p className="cartPage__emptyMessage">
                Votre panier est vide pour le moment. Découvrez nos produits et services pour commencer vos achats.
              </p>
              <button
                type="button"
                className="cartPage__emptyAction"
                onClick={() => triggerNavigation('/products')}
              >
                Voir les produits
              </button>
            </div>
          ) : (
            cartItems.map((item: CartItem) => {
              const itemQuantity = Math.max(1, Number.parseInt(String(item.quantity ?? 1), 10) || 1);
              const unitPriceLabel = formatCurrency(item.unitPrice ?? 0);
              const totalPriceLabel = formatCurrency(item.totalPrice ?? (itemQuantity * (item.unitPrice ?? 0)));
              const reservationLabel = isReservationItem(item) ? getReservationLabels(item) : null;
              const itemTypeLabel = isProductItem(item) ? 'Produit' : isReservationItem(item) ? 'Réservation' : 'Article';

              return (
                <article
                  key={item.id}
                  className="cartPage__item"
                  itemProp="itemListElement"
                  itemScope
                  itemType={isProductItem(item) ? 'https://schema.org/Product' : 'https://schema.org/EventReservation'}
                  data-cart-item-type={item.type}
                >
                  <div className="cartPage__itemImage" aria-hidden="true">
                    {isProductItem(item) && item.metadata?.imageUrl ? (
                      <Image
                        src={item.metadata.imageUrl}
                        alt={item.title || 'Visuel produit'}
                        width={96}
                        height={96}
                      />
                    ) : (
                      <span aria-hidden="true">{itemTypeLabel}</span>
                    )}
                  </div>

                  <div className="cartPage__itemContent">
                    <h2 className="cartPage__itemTitle" itemProp="name">
                      {item.title || 'Article'}
                    </h2>

                    <div className="cartPage__itemMeta">
                      <span>{itemTypeLabel}</span>
                      {isProductItem(item) && item.metadata?.description ? (
                        <span>{item.metadata.description}</span>
                      ) : null}
                      {reservationLabel ? <span>{reservationLabel}</span> : null}
                      {item.metadata?.variations && Array.isArray(item.metadata.variations) ? (
                        <span>
                          {item.metadata.variations.map((variation: any) => variation?.name).filter(Boolean).join(' · ')}
                        </span>
                      ) : null}
                    </div>

                    <div className="cartPage__itemControls">
                      <div className="cartPage__itemQuantity" role="group" aria-label={`Quantité pour ${item.title || 'article'}`}>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, itemQuantity - 1)}
                          aria-label="Diminuer la quantité"
                          disabled={itemQuantity <= 1}
                        >
                          −
                        </button>
                        <span aria-live="polite">{itemQuantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, itemQuantity + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      <span className="cartPage__itemPrice" itemProp="price">
                        {totalPriceLabel}
                      </span>

                      <button
                        type="button"
                        className="cartPage__itemRemove"
                        onClick={() => handleRemove(item.id)}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside className="cartPage__sidebar" aria-label="Récapitulatif du panier">
          <div className="cartPage__totals">
            <div className="cartPage__totalsRow">
              <span>Sous-total</span>
              <span>{subtotalLabel}</span>
            </div>
            <div className="cartPage__totalsRow">
              <span>Articles</span>
              <span>{totalQuantityLabel}</span>
            </div>
            <div className="cartPage__totalsRow cartPage__totalsRow--accent">
              <span>Total</span>
              <span>{subtotalLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className="cartPage__checkout"
            onClick={handleCheckout}
            disabled={isCartEmpty}
          >
            Passer à la caisse
          </button>

          <Link
            href="/"
            className="cartPage__emptyAction"
            onClick={(event) => {
              event.preventDefault();
              triggerNavigation('/');
            }}
          >
            Continuer vos achats
          </Link>

          {!isCartEmpty ? (
            <button type="button" className="cartPage__itemRemove" onClick={handleClearCart}>
              Vider le panier
            </button>
          ) : null}

          <p className="cartPage__legal">
            Livraison et taxes calculées lors de la validation. En poursuivant, vous acceptez nos conditions générales de vente.
          </p>
        </aside>
      </section>
    </main>
  );
}
