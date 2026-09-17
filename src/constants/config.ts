export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api/v1' : 'https://api.kickat.co.in/api/v1'),
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
