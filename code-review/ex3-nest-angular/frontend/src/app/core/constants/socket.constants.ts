export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  AUTHENTICATE: 'authenticate',
  UNAUTHORIZED: 'unauthorized',

  JOIN_AUCTION: 'joinAuction',
  LEAVE_AUCTION: 'leaveAuction',
  PLACE_BID: 'placeBid',
  SET_AUTO_BID: 'setAutoBid',
  CANCEL_AUTO_BID: 'cancelAutoBid',

  BID_PLACED: 'bidPlaced',
  BID_PLACED_RESULT: 'bidPlacedResult',
  AUCTION_UPDATED: 'auctionUpdated',
  AUCTION_ENDED: 'auctionEnded',
  AUCTION_EXTENDED: 'auctionExtended',
  USER_OUTBID: 'userOutbid',
  RESERVE_MET: 'reserveMet',
  COUNTDOWN_UPDATE: 'countdownUpdate',
  DUTCH_PRICE_UPDATE: 'dutchPriceUpdate',
  VIEWER_COUNT: 'viewerCount',

  MARK_NOTIFICATION_READ: 'markNotificationRead',
  GET_UNREAD_COUNT: 'getUnreadCount',
  NEW_NOTIFICATION: 'newNotification',
  UNREAD_COUNT_UPDATED: 'unreadCountUpdated',
} as const;
