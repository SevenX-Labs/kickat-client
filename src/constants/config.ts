export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.SERVER_API_URL || '',
  APP_NAME: 'Kickat',
  CURRENCY: '₹',
};

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (id: string) => `/products/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
  ONBOARDING: '/onboarding',
  LOGIN: '/login',
};
