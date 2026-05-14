export const UI_CONSTANTS = {
  pagination: {
    defaultLimit: 20,
    defaultPage: 1,
    limitOptions: [10, 20, 50, 100],
  },
  labels: {
    placeBid: 'Place Bid',
    buyNow: 'Buy Now',
    watch: 'Watch',
    unwatch: 'Unwatch',
    endingSoon: 'Ending soon',
    noData: 'No data found',
  },
  timing: {
    auctionPollingMs: 10000,
    bidHistoryPollingMs: 7000,
    reconnectDelayMs: 2000,
    notificationRefreshMs: 30000,
  },
} as const;
