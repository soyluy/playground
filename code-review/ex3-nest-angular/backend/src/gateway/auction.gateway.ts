import {
  ConnectedSocket,
  OnGatewayInit,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { AuctionService } from '../modules/auction/auction.service';
import { BidService } from '../modules/bid/bid.service';
import { NotificationService } from '../modules/notification/notification.service';
import { TokenService } from '../auth/services/token.service';
import { JoinAuctionDto } from './dto/join-auction.dto';
import { PresenceService } from './services/presence.service';
import { RoomService } from './services/room.service';
import { BidGateway } from './bid.gateway';

type SocketUser = {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
};

@Injectable()
@WebSocketGateway({
  namespace: '/auction',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server!: Server;

  private readonly _logger = new Logger(AuctionGateway.name);

  constructor(
    private readonly _auctionService: AuctionService,
    private readonly _bidService: BidService,
    private readonly _notificationService: NotificationService,
    private readonly _tokenService: TokenService,
    private readonly _roomService: RoomService,
    private readonly _presenceService: PresenceService,
    @Inject(forwardRef(() => BidGateway))
    private readonly _bidGateway: BidGateway,
  ) {}

  afterInit(): void {
    this._logger.debug(`Auction gateway init bidGateway=${this._bidGateway.constructor.name}`);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authenticateSocket(client);
      client.data.user = user;
      this._presenceService.trackConnection(user.id, client.id);
      this._logger.debug(`Auction socket connected user=${user.id} socket=${client.id}`);
    } catch (error) {
      this._logger.warn(
        `Auction socket rejected socket=${client.id} reason=${
          error instanceof Error ? error.message : 'auth_failed'
        }`,
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data?.user?.id as string | undefined;
    if (userId) {
      this._presenceService.trackDisconnection(userId, client.id);
      this._roomService.leaveAllRooms(client);
    }
  }

  @SubscribeMessage('authenticate')
  async authenticate(@ConnectedSocket() client: Socket): Promise<{ success: boolean }> {
    await this.authenticateSocket(client);
    return { success: true };
  }

  @SubscribeMessage('joinAuction')
  async joinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinAuctionDto,
  ): Promise<{ success: boolean; auctionId: string }> {
    const user = this.requireUser(client);
    const auction = await this._auctionService.getAuction(dto.auctionId);
    const room = `auction:${auction.id}`;

    this._roomService.joinRoom(client, room);
    const roomSize = this._roomService.getRoomSize(room);

    const highestBid = await this._bidService.getHighestBid(auction.id);
    client.emit('auctionUpdated', {
      auctionId: auction.id,
      status: auction.status,
      currentPrice: auction.currentPrice,
      highestBid: highestBid
        ? {
            amount: highestBid.amount,
            bidderId: highestBid.bidder.id,
            createdAt: highestBid.createdAt,
          }
        : null,
      endTime: auction.endTime,
      watcherCount: roomSize,
    });

    this.server.to(`auctions:${auction.id}`).emit('viewerCount', {
      auctionId: auction.id,
      viewers: roomSize,
    });

    await this._notificationService.getUnreadCount(user.id);
    return { success: true, auctionId: auction.id };
  }

  @SubscribeMessage('leaveAuction')
  async leaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinAuctionDto,
  ): Promise<{ success: boolean; auctionId: string }> {
    this.requireUser(client);
    const room = `auction:${dto.auctionId}`;

    this._roomService.leaveRoom(client, room);
    const roomSize = this._roomService.getRoomSize(room);
    this.server.to(room).emit('viewerCount', {
      auctionId: dto.auctionId,
      viewers: roomSize,
    });

    return { success: true, auctionId: dto.auctionId };
  }

  emitBidPlaced(auctionId: string, payload: Record<string, unknown>): void {
    this.server.to(`auction:${auctionId}`).emit('bidPlaced', payload);
  }

  emitAuctionUpdated(auctionId: string, payload: Record<string, unknown>): void {
    this.server.to(`auction:${auctionId}`).emit('auctionUpdated', payload);
  }

  emitAuctionEnded(auctionId: string, payload: Record<string, unknown>): void {
    this.server.to(`auction:${auctionId}`).emit('auctionEnded', payload);
  }

  emitAuctionExtended(auctionId: string, payload: Record<string, unknown>): void {
    this.server.to(`auction:${auctionId}`).emit('auctionExtended', payload);
  }

  emitUserOutbid(userId: string, payload: Record<string, unknown>): void {
    this._roomService.broadcastToUser(this.server, userId, 'userOutbid', payload);
  }

  emitReserveMet(auctionId: string, payload: Record<string, unknown>): void {
    this.server.to(`auction:${auctionId}`).emit('reserveMet', payload);
  }

  emitCountdownUpdate(auctionId: string, remainingSeconds: number): void {
    this.server.to(`auction:${auctionId}`).emit('countdownUpdate', {
      auctionId,
      remainingSeconds,
    });
  }

  emitDutchPriceUpdate(auctionId: string, currentPrice: number): void {
    this.server.to(`auction:${auctionId}`).emit('dutchPriceUpdate', {
      auctionId,
      currentPrice,
    });
  }

  emitViewerCount(auctionId: string, viewers: number): void {
    this.server.to(`auction:${auctionId}`).emit('viewerCount', { auctionId, viewers });
  }

  private async authenticateSocket(client: Socket): Promise<SocketUser> {
    const authHeader =
      (client.handshake.headers.authorization as string | undefined) ??
      (client.handshake.auth?.token as string | undefined);

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader?.trim();
    if (!token) {
      throw new Error('Missing access token');
    }

    const payload = await this._tokenService.validateAccessToken(token);
    const user: SocketUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isVerified: payload.isVerified,
      isBanned: payload.isBanned,
    };
    client.data.user = user;
    return user;
  }

  private requireUser(client: Socket): SocketUser {
    const user = client.data?.user as SocketUser | undefined;
    if (!user?.id) {
      throw new Error('Unauthenticated socket');
    }
    return user;
  }
}
