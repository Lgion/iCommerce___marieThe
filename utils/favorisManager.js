import storageManager from '@/utils/storageManager';

const CART_KEY = 'cart:favoris';

export function getAllFavoris() {
  const stored = storageManager.readJSON(CART_KEY, null);
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    return stored;
  }
  return {};
}

export function saveArticle(object, key = CART_KEY) {
  const safeObject = typeof object === 'object' && object !== null ? object : {};
  if (key === CART_KEY) {
    storageManager.writeJSON(CART_KEY, safeObject);
    return;
  }
  storageManager.writeJSON(key, safeObject);
}

export function addArticle(articleID, qty) {
  if (!articleID) {
    return;
  }
  const current = getAllFavoris();
  const nextQuantity = typeof qty === 'number' && qty > 0 ? qty : 1;
  const next = {
    ...current,
    [articleID]: nextQuantity
  };
  storageManager.writeJSON(CART_KEY, next);
}

export function deleteArticle(articleID) {
  if (!articleID) {
    return;
  }
  const current = getAllFavoris();
  if (!(articleID in current)) {
    return;
  }
  const { [articleID]: _removed, ...rest } = current;
  storageManager.writeJSON(CART_KEY, rest);
}

export function getFavorisIDs() {
  return Object.keys(getAllFavoris());
}
