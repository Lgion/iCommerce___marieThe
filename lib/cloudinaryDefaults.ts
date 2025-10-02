const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfpxi9ywm';
const DEFAULT_BASE_PATH = 'icommerce/defaults';

export const DEFAULT_PRODUCT_IMAGE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1727788800/${DEFAULT_BASE_PATH}/product_default.png`;
export const DEFAULT_SERVICE_PROFILE_IMAGE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1727788800/${DEFAULT_BASE_PATH}/service_profile_default.png`;
export const DEFAULT_SERVICE_CARD_IMAGE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1727788800/${DEFAULT_BASE_PATH}/service_card_default.png`;
