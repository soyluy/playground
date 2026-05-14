import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuctionItem } from '../domain/entities/auction-item.entity';
import { Auction } from '../domain/entities/auction.entity';
import { AutoBid } from '../domain/entities/auto-bid.entity';
import { Bid } from '../domain/entities/bid.entity';
import { Category } from '../domain/entities/category.entity';
import { Notification } from '../domain/entities/notification.entity';
import { Transaction } from '../domain/entities/transaction.entity';
import { User } from '../domain/entities/user.entity';
import { Watchlist } from '../domain/entities/watchlist.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'auction_platform'),
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
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        synchronize: false,
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        ssl:
          configService.get<string>('DB_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
