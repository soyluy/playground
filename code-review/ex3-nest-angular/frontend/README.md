# Live Auction Frontend

Angular 21 frontend for the live auction platform. Part of a **code review** exercise — see [`../README.md`](../README.md). Covers buyer bidding, seller listings, admin monitoring, and realtime updates through Socket.io.

## Stack

- Angular 21 standalone APIs (zoneless)
- Angular Material UI components
- RxJS + signals for state and async flows
- Socket.io client for realtime auctions and notifications

## Project Structure

- `src/app/core`: auth, guards, interceptors, constants, models, utilities
- `src/app/features`: feature pages/components/services
- `src/app/layout`: app shell and header
- `src/app/shared`: reusable components and pipes
- `src/environments`: runtime environment configuration

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run in development:

   ```bash
   npm run start
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Routing Overview

- `/auctions`: public auction listing and detail
- `/auctions/create`: seller-only auction creation
- `/auth/*`: login/register/reset flows
- `/profile`: authenticated user profile and wallet
- `/admin`: admin dashboard and moderation pages

## Realtime WebSocket Events

Client subscribes/emits using these core event names:

- `authenticate`
- `joinAuction`, `leaveAuction`
- `bidPlaced`, `auctionUpdated`, `auctionEnded`, `auctionExtended`
- `userOutbid`, `reserveMet`, `countdownUpdate`, `dutchPriceUpdate`, `viewerCount`
- `newNotification`, `unreadCountUpdated`
- `platformStats`, `auctionMonitor`, `suspiciousBidAlert`

## Architecture Notes

- Feature services encapsulate API calls and local signal state.
- Realtime services bridge socket streams to signal updates for UI components.
- Guards and resolvers enforce route access and preload critical auction/item data.
- Shared components and pipes keep formatting and view logic consistent across pages.
