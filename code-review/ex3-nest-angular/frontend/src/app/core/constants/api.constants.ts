import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    me: '/users/me',
    auctions: '/users/me/auctions',
    bids: '/users/me/bids',
    transactions: '/users/me/transactions',
    watchlist: '/users/me/watchlist',
    notifications: '/users/me/notifications',
    deposit: '/users/me/deposit',
    withdraw: '/users/me/withdraw',
  },
  auctions: {
    root: '/auctions',
    search: '/auctions/search',
    byId: (id: string) => `/auctions/${id}`,
    publish: (id: string) => `/auctions/${id}/publish`,
    cancel: (id: string) => `/auctions/${id}/cancel`,
    buyNow: (id: string) => `/auctions/${id}/buy-now`,
    watch: (id: string) => `/auctions/${id}/watch`,
    unwatch: (id: string) => `/auctions/${id}/unwatch`,
    bids: (id: string) => `/auctions/${id}/bids`,
    stats: (id: string) => `/auctions/${id}/stats`,
    autoBid: (id: string) => `/auctions/${id}/auto-bid`,
  },
  items: {
    root: '/items',
    byId: (id: string) => `/items/${id}`,
    submit: (id: string) => `/items/${id}/submit`,
    approve: (id: string) => `/items/${id}/approve`,
    reject: (id: string) => `/items/${id}/reject`,
    mine: '/items/users/me/items',
  },
  admin: {
    stats: '/admin/stats',
    auctions: '/admin/auctions',
    users: '/admin/users',
    banUser: (id: string) => `/admin/users/${id}/ban`,
    unbanUser: (id: string) => `/admin/users/${id}/unban`,
    forceEndAuction: (id: string) => `/admin/auctions/${id}/force-end`,
    cancelAuction: (id: string) => `/admin/auctions/${id}/cancel`,
    revenue: '/admin/reports/revenue',
    activity: '/admin/reports/activity',
  },
} as const;
