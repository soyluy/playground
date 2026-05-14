import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AuctionGateway } from './auction.gateway';
import { BidGateway } from './bid.gateway';
import { NotificationGateway } from './notification.gateway';
import { AdminGateway } from './admin.gateway';
import { PresenceService } from './services/presence.service';
import { RoomService } from './services/room.service';
import { WsAuthMiddleware } from './middleware/ws-auth.middleware';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { AuctionService } from '../modules/auction/auction.service';
import { AutoBidService } from '../modules/bid/auto-bid.service';
import { BidService } from '../modules/bid/bid.service';
import { NotificationService } from '../modules/notification/notification.service';
import { PaymentService } from '../modules/payment/payment.service';
import { PricingService } from '../modules/pricing/pricing.service';
import { UserService } from '../modules/user/user.service';
import { WalletService } from '../modules/wallet/wallet.service';
import { PaymentGatewayClient } from '../infrastructure/external/payment-gateway.client';
import { AuctionRepository } from '../infrastructure/repositories/auction.repository';
import { AutoBidRepository } from '../infrastructure/repositories/auto-bid.repository';
import { BidRepository } from '../infrastructure/repositories/bid.repository';
import { NotificationRepository } from '../infrastructure/repositories/notification.repository';
import { TransactionRepository } from '../infrastructure/repositories/transaction.repository';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { WatchlistRepository } from '../infrastructure/repositories/watchlist.repository';

@Module({
  imports: [ConfigModule, DatabaseModule, JwtModule, forwardRef(() => AuthModule)],
  providers: [
    AuctionGateway,
    BidGateway,
    NotificationGateway,
    AdminGateway,
    RoomService,
    PresenceService,
    WsAuthMiddleware,
    WsJwtGuard,
    WsRolesGuard,
    AuctionService,
    BidService,
    AutoBidService,
    UserService,
    WalletService,
    PricingService,
    NotificationService,
    PaymentService,
    PaymentGatewayClient,
    UserRepository,
    AuctionRepository,
    BidRepository,
    AutoBidRepository,
    NotificationRepository,
    TransactionRepository,
    WatchlistRepository,
  ],
  exports: [AuctionGateway, BidGateway, NotificationGateway, AdminGateway, RoomService, PresenceService],
})
export class GatewayModule {}
