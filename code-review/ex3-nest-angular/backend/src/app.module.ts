import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AuctionController } from './modules/auction/controllers/auction.controller';
import { AuctionItemController } from './modules/auction-item/controllers/auction-item.controller';
import { BidController } from './modules/bid/controllers/bid.controller';
import { UserController } from './modules/user/controllers/user.controller';
import { AdminController } from './modules/admin/controllers/admin.controller';
import { AuctionService } from './modules/auction/auction.service';
import { AuctionItemService } from './modules/auction-item/auction-item.service';
import { BidService } from './modules/bid/bid.service';
import { AutoBidService } from './modules/bid/auto-bid.service';
import { CategoryService } from './modules/category/category.service';
import { NotificationService } from './modules/notification/notification.service';
import { PaymentService } from './modules/payment/payment.service';
import { PricingService } from './modules/pricing/pricing.service';
import { UserService } from './modules/user/user.service';
import { WalletService } from './modules/wallet/wallet.service';
import { AuctionEventListener } from './modules/auction/listeners/auction-event.listener';
import { BidEventListener } from './modules/bid/listeners/bid-event.listener';
import { PaymentGatewayClient } from './infrastructure/external/payment-gateway.client';
import { EmailClient } from './infrastructure/external/email.client';
import { AuctionLifecycleScheduler } from './infrastructure/schedulers/auction-lifecycle.scheduler';
import { CleanupScheduler } from './infrastructure/schedulers/cleanup.scheduler';
import { PaymentScheduler } from './infrastructure/schedulers/payment-scheduler';
import { GatewayModule } from './gateway/gateway.module';
import { AuctionRepository } from './infrastructure/repositories/auction.repository';
import { AutoBidRepository } from './infrastructure/repositories/auto-bid.repository';
import { BidRepository } from './infrastructure/repositories/bid.repository';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { TransactionRepository } from './infrastructure/repositories/transaction.repository';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { WatchlistRepository } from './infrastructure/repositories/watchlist.repository';
import appConfig from './config/app.config';
import dbConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', 'postgres'),
        database: configService.get<string>('database.name', 'auction_platform'),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<boolean>('database.logging', false),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 20,
      delimiter: '.',
    }),
    DatabaseModule,
    AuthModule,
    GatewayModule,
  ],
  controllers: [
    AuctionController,
    BidController,
    UserController,
    AuctionItemController,
    AdminController,
  ],
  providers: [
    UserRepository,
    AuctionRepository,
    BidRepository,
    AutoBidRepository,
    TransactionRepository,
    NotificationRepository,
    WatchlistRepository,
    UserService,
    AuctionService,
    AuctionItemService,
    BidService,
    AutoBidService,
    WalletService,
    PaymentService,
    NotificationService,
    CategoryService,
    PricingService,
    PaymentGatewayClient,
    EmailClient,
    AuctionEventListener,
    BidEventListener,
    AuctionLifecycleScheduler,
    PaymentScheduler,
    CleanupScheduler,
  ],
})
export class AppModule {}
