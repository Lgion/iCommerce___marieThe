'use client';

import storageManager from '@/utils/storageManager';

const CART_KEY = 'cart';
const DEFAULT_CURRENCY = 'EUR';

const createDefaultCart = () => ({
  items: [],
  currency: DEFAULT_CURRENCY,
  updatedAt: new Date().toISOString(),
});

const normalizeCart = (cartLike) => {
  if (!cartLike || typeof cartLike !== 'object') {
    return createDefaultCart();
  }
  const items = Array.isArray(cartLike.items) ? cartLike.items.filter(Boolean) : [];
  return {
    currency: typeof cartLike.currency === 'string' ? cartLike.currency : DEFAULT_CURRENCY,
    items,
    updatedAt: cartLike.updatedAt || new Date().toISOString(),
  };
};

const cloneCart = (cart) => {
  const normalized = normalizeCart(cart);
  return {
    ...normalized,
    items: normalized.items.map((item) => ({ ...item })),
    updatedAt: new Date().toISOString(),
  };
};

const readCart = () => normalizeCart(storageManager.readJSON(CART_KEY, createDefaultCart()));

const writeCart = (cart) => {
  const normalized = normalizeCart(cart);
  normalized.updatedAt = new Date().toISOString();
  storageManager.writeJSON(CART_KEY, normalized);
  return normalized;
};

const clearCart = () => writeCart(createDefaultCart());

const computeTotals = (cart) => {
  const normalized = normalizeCart(cart);
  const totals = normalized.items.reduce(
    (accumulator, item) => {
      const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
      const unitPrice = Number.parseFloat(item.unitPrice) || 0;
      const totalPrice = quantity * unitPrice;
      accumulator.totalQuantity += quantity;
      accumulator.subtotal += totalPrice;
      return accumulator;
    },
    { subtotal: 0, totalQuantity: 0 }
  );
  return {
    currency: normalized.currency,
    subtotal: Number.parseFloat(totals.subtotal.toFixed(2)),
    totalQuantity: totals.totalQuantity,
    distinctItems: normalized.items.length,
    updatedAt: normalized.updatedAt,
  };
};

const generateCartItemId = (type, identifier, extra = '') => {
  const normalizedType = type || 'unknown';
  const normalizedIdentifier = identifier || crypto.randomUUID?.() || `${Date.now()}`;
  const suffix = extra ? `-${extra}` : '';
  return `${normalizedType}-${normalizedIdentifier}${suffix}`;
};

const upsertItem = (cart, predicate, nextItemFactory) => {
  const workingCart = cloneCart(cart);
  const index = workingCart.items.findIndex(predicate);
  if (index >= 0) {
    const updated = nextItemFactory(workingCart.items[index]);
    workingCart.items.splice(index, 1, { ...workingCart.items[index], ...updated, totalPrice: calculateTotalPrice(updated) });
  } else {
    const created = nextItemFactory(null);
    workingCart.items.push({ ...created, totalPrice: calculateTotalPrice(created) });
  }
  return writeCart(workingCart);
};

const calculateTotalPrice = (item) => {
  const quantity = Math.max(1, Number.parseInt(item?.quantity ?? 1, 10));
  const unitPrice = Number.parseFloat(item?.unitPrice ?? 0);
  return Number.parseFloat((quantity * unitPrice).toFixed(2));
};

const ensureQuantity = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const addProductToCart = (cart, payload = {}) => {
  const {
    productId,
    title,
    price,
    imageUrl,
    quantity = 1,
    shopId,
    metadata = {},
  } = payload;

  if (!productId) {
    throw new Error('cartManager.addProductToCart: productId requis');
  }

  const normalizeMetadata = {
    imageUrl: imageUrl || null,
    shopId: shopId || null,
    ...metadata,
  };

  return upsertItem(
    cart,
    (item) => item.type === 'product' && item.referenceId === productId,
    (existing) => {
      const nextQuantity = ensureQuantity(existing ? existing.quantity + quantity : quantity);
      return {
        id: existing?.id || generateCartItemId('product', productId),
        type: 'product',
        referenceId: productId,
        quantity: nextQuantity,
        unitPrice: Number.parseFloat(price ?? existing?.unitPrice ?? 0),
        totalPrice: 0,
        title: title || existing?.title || 'Produit',
        metadata: {
          ...existing?.metadata,
          ...normalizeMetadata,
        },
      };
    }
  );
};

const addReservationToCart = (cart, payload = {}) => {
  const {
    slotId,
    serviceId,
    serviceName,
    startTime,
    endTime,
    durationMinutes,
    unitPrice,
    quantity = 1,
    metadata = {},
  } = payload;

  if (!slotId) {
    throw new Error('cartManager.addReservationToCart: slotId requis');
  }

  const referenceComposite = `${slotId}-${startTime || ''}`;

  const reservationMetadata = {
    serviceName: serviceName || metadata?.serviceName || 'Service',
    startTime: startTime || null,
    endTime: endTime || null,
    durationMinutes: durationMinutes || metadata?.durationMinutes || null,
    ...metadata,
  };

  return upsertItem(
    cart,
    (item) => item.type === 'reservation' && item.referenceId === slotId,
    () => ({
      id: generateCartItemId('reservation', referenceComposite),
      type: 'reservation',
      referenceId: slotId,
      serviceId: serviceId || null,
      quantity: ensureQuantity(quantity, 1),
      unitPrice: Number.parseFloat(unitPrice ?? 0),
      totalPrice: 0,
      title: serviceName || reservationMetadata.serviceName,
      metadata: reservationMetadata,
    })
  );
};

const updateItemQuantity = (cart, itemId, quantity) => {
  if (!itemId) {
    return writeCart(cart);
  }
  const normalizedQuantity = ensureQuantity(quantity);
  const workingCart = cloneCart(cart);
  const index = workingCart.items.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return writeCart(workingCart);
  }
  workingCart.items[index] = {
    ...workingCart.items[index],
    quantity: normalizedQuantity,
    totalPrice: calculateTotalPrice({ ...workingCart.items[index], quantity: normalizedQuantity }),
  };
  return writeCart(workingCart);
};

const removeItem = (cart, itemId) => {
  if (!itemId) {
    return writeCart(cart);
  }
  const workingCart = cloneCart(cart);
  const filteredItems = workingCart.items.filter((item) => item.id !== itemId);
  return writeCart({ ...workingCart, items: filteredItems });
};

const cartManager = {
  CART_KEY,
  readCart,
  writeCart,
  clearCart,
  computeTotals,
  addProductToCart,
  addReservationToCart,
  updateItemQuantity,
  removeItem,
};

export default cartManager;
