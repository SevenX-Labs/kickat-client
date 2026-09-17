export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.kickat.co.in/api/v1',
  APP_NAME: 'Kickat',
  CURRENCY: '₹',
};

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (id: string) => `/products/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  LOGIN: '/login',
};
