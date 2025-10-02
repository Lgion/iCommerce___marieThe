'use client';

const ACTIVE_SHOP_KEY = process.env.NEXT_PUBLIC_ACTIVE_SHOP_KEY || 'icommerce.activeShopId';
const DEFAULT_SHOP_ID = 'default-shop';
const SHOP_PREFIX = 'shop-';

let cachedActiveShopId = null;
let cachedBucket = null;

const hasWindow = () => typeof window !== 'undefined';

const getBucketKey = () => {
  const active = getActiveShopId() || DEFAULT_SHOP_ID;
  const truncated = normalizeShopId(active).slice(0, 18);
  return `${SHOP_PREFIX}${truncated}`;
};

const normalizeShopId = (shopId) => {
  const raw = typeof shopId === 'string' ? shopId.trim() : String(shopId || '');
  return raw.replace(/[^a-zA-Z0-9_-]/g, '');
};

const sanitizeShopId = (shopId) => {
  const normalized = normalizeShopId(shopId);
  return normalized || DEFAULT_SHOP_ID;
};

const getActiveShopId = () => {
  if (cachedActiveShopId) {
    return cachedActiveShopId;
  }
  if (!hasWindow()) {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(ACTIVE_SHOP_KEY);
    if (stored) {
      cachedActiveShopId = sanitizeShopId(stored);
      return cachedActiveShopId;
    }
  } catch (error) {
    console.error('[storageManager][getActiveShopId]', error);
  }
  return null;
};

const setActiveShopId = (shopId) => {
  const normalized = sanitizeShopId(shopId);
  cachedActiveShopId = normalized;
  cachedBucket = null;
  if (!hasWindow()) {
    return cachedActiveShopId;
  }
  try {
    window.localStorage.setItem(ACTIVE_SHOP_KEY, normalized);
  } catch (error) {
    console.error('[storageManager][setActiveShopId]', error);
  }
  return cachedActiveShopId;
};

const readBucket = () => {
  if (cachedBucket) {
    return cachedBucket;
  }
  if (!hasWindow()) {
    return {};
  }
  const bucketKey = getBucketKey();
  try {
    const raw = window.localStorage.getItem(bucketKey);
    if (!raw) {
      cachedBucket = {};
      return cachedBucket;
    }
    const parsed = JSON.parse(raw);
    cachedBucket = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    return cachedBucket;
  } catch (error) {
    console.error(`[storageManager][readBucket:${bucketKey}]`, error);
    cachedBucket = {};
    return cachedBucket;
  }
};

const writeBucket = (bucket) => {
  if (!hasWindow()) {
    return;
  }
  const bucketKey = getBucketKey();
  const safeBucket = bucket && typeof bucket === 'object' && !Array.isArray(bucket) ? bucket : {};
  cachedBucket = safeBucket;
  try {
    window.localStorage.setItem(bucketKey, JSON.stringify(safeBucket));
  } catch (error) {
    console.error(`[storageManager][writeBucket:${bucketKey}]`, error);
  }
};

const readFromBucket = (key, fallback = null) => {
  const bucket = readBucket();
  const value = bucket[key];
  return value === undefined ? fallback : value;
};

const writeToBucket = (key, value) => {
  const bucket = { ...readBucket(), [key]: value };
  writeBucket(bucket);
};

const removeFromBucket = (key) => {
  const bucket = { ...readBucket() };
  if (key in bucket) {
    delete bucket[key];
    writeBucket(bucket);
  }
};

const readGlobal = (key, fallback = null) => {
  if (!hasWindow()) {
    return fallback;
  }
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    console.error(`[storageManager][readGlobal:${key}]`, error);
    return fallback;
  }
};

const writeGlobal = (key, value) => {
  if (!hasWindow()) {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`[storageManager][writeGlobal:${key}]`, error);
  }
};

const removeGlobal = (key) => {
  if (!hasWindow()) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[storageManager][removeGlobal:${key}]`, error);
  }
};

const read = (key, fallback = null) => {
  const value = readFromBucket(key, null);
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error(`[storageManager][read stringify fallback:${key}]`, error);
    return fallback;
  }
};

const write = (key, value) => {
  writeToBucket(key, value);
};

const remove = (key) => {
  removeFromBucket(key);
};

const readJSON = (key, fallback = null) => {
  const value = readFromBucket(key, null);
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`[storageManager][readJSON parse:${key}]`, error);
      return fallback;
    }
  }
  return value;
};

const writeJSON = (key, value) => {
  writeToBucket(key, value);
};

const migrateLegacyKeys = (legacyMap = {}) => {
  if (!hasWindow()) {
    return;
  }
  const bucket = { ...readBucket() };
  Object.entries(legacyMap).forEach(([legacyKey, targetKey]) => {
    const destinationKey = targetKey || legacyKey;
    try {
      const storedValue = window.localStorage.getItem(legacyKey);
      if (storedValue !== null) {
        let parsed = storedValue;
        try {
          parsed = JSON.parse(storedValue);
        } catch {
          parsed = storedValue;
        }
        bucket[destinationKey] = parsed;
        window.localStorage.removeItem(legacyKey);
      }
    } catch (error) {
      console.error(`[storageManager][migrate:${legacyKey}]`, error);
    }
  });
  writeBucket(bucket);
};

const storageManager = {
  ACTIVE_SHOP_KEY,
  DEFAULT_SHOP_ID,
  getActiveShopId,
  setActiveShopId,
  readFromBucket,
  writeToBucket,
  removeFromBucket,
  read,
  write,
  remove,
  readJSON,
  writeJSON,
  readGlobal,
  writeGlobal,
  removeGlobal,
  migrateLegacyKeys,
};

export default storageManager;
