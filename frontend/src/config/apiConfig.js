export const API_CONFIG = {
  BASE_URL: 'https://filbackendnew.onrender.com',
  FRONTEND_URL: 'https://filfrontendnew.vercel.app',
  API_ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    USER_PROFILE: '/users',
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_MARK_READ: (id) => `/notifications/${id}/mark-read`,
    NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
    NOTIFICATIONS_DELETE: (id) => `/notifications/${id}`,
    NOTIFICATIONS_DELETE_ALL: '/notifications',
    ORDERS: '/orders',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    SELLER_INFO: '/seller-info',
    COUPONS: '/coupons',
    COUPON_BY_CODE: (code) => `/coupons/code/${code}`,
    USER_ORDERS: (userId) => `/orders/user/${userId}`,
    USER_PROFILE_DETAIL: (userId) => `/users/${userId}`,
    USER_PROFILE_ADMIN: (userId) => `/users/admin/${userId}`,
    USER_ORDERS_BY_USERID: (userId) => `/users/${userId}/orders`,
    CUSTOMER_ACCOUNT: (userId) => `/customer-accounts/${userId}`,
    USER_PAYMENT: (userId, paymentId) => `/users/${userId}/payments/${paymentId}`
  }
};

export const getFullApiUrl = (endpoint) => {
  const baseUrl = `${API_CONFIG.BASE_URL}/api`;
  if (typeof endpoint === 'function') {
    return (param) => `${baseUrl}${endpoint(param)}`;
  }
  return `${baseUrl}${endpoint}`;
}; 