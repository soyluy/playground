import 'dotenv/config';
import { DataSource } from 'typeorm';

import { AuctionItem } from '../domain/entities/auction-item.entity';
import { Auction } from '../domain/entities/auction.entity';
import { AutoBid } from '../domain/entities/auto-bid.entity';
import { Bid } from '../domain/entities/bid.entity';
import { Category } from '../domain/entities/category.entity';
import { Notification } from '../domain/entities/notification.entity';
import { Transaction } from '../domain/entities/transaction.entity';
import { User } from '../domain/entities/user.entity';
import { Watchlist } from '../domain/entities/watchlist.entity';
import { AddIndexes1700000009 } from './migrations/1700000009-AddIndexes';
import { CreateAuctionItems1700000003 } from './migrations/1700000003-CreateAuctionItems';
import { CreateAuctions1700000004 } from './migrations/1700000004-CreateAuctions';
import { CreateAutoBids1700000006 } from './migrations/1700000006-CreateAutoBids';
import { CreateBids1700000005 } from './migrations/1700000005-CreateBids';
import { CreateCategories1700000002 } from './migrations/1700000002-CreateCategories';
import { CreateNotificationsAndWatchlist1700000008 } from './migrations/1700000008-CreateNotificationsAndWatchlist';
import { CreateTransactions1700000007 } from './migrations/1700000007-CreateTransactions';
import { CreateUsers1700000001 } from './migrations/1700000001-CreateUsers';

const port = Number(process.env.DB_PORT ?? '5432');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.isNaN(port) ? 5432 : port,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'auction_platform',
  entities: [
    User,
    Category,
    AuctionItem,
    Auction,
    Bid,
    AutoBid,
    Watchlist,
    Transaction,
    Notification,
  ],
  migrations: [
    CreateUsers1700000001,
    CreateCategories1700000002,
    CreateAuctionItems1700000003,
    CreateAuctions1700000004,
    CreateBids1700000005,
    CreateAutoBids1700000006,
    CreateTransactions1700000007,
    CreateNotificationsAndWatchlist1700000008,
    AddIndexes1700000009,
  ],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
