import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../domain/enums/user-role.enum';
import { AuctionService } from '../modules/auction/auction.service';
import { UserService } from '../modules/user/user.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { RoomService } from './services/room.service';

@Injectable()
@WebSocketGateway({
  namespace: '/admin',
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard, WsRolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly _auctionService: AuctionService,
    private readonly _userService: UserService,
    private readonly _roomService: RoomService,
  ) {}

  @SubscribeMessage('joinAdminRoom')
  joinAdminRoom(@ConnectedSocket() client: Socket): void {
    this._roomService.joinRoom(client, 'admin:global');
  }

  @SubscribeMessage('banUser')
  async banUser(
    @ConnectedSocket() _client: Socket,
    @MessageBody() dto: { userId: string },
  ): Promise<void> {
    const user = await this._userService.banUser(dto.userId);
    this.server.to('admin:global').emit('auctionMonitor', {
      type: 'USER_BANNED',
      userId: user.id,
      at: new Date().toISOString(),
    });
  }

  @SubscribeMessage('forceEndAuction')
  async forceEndAuction(
    @ConnectedSocket() _client: Socket,
    @MessageBody() dto: { auctionId: string },
  ): Promise<void> {
    const auction = await this._auctionService.processAuctionEnd(dto.auctionId, new Date());
    this.server.to('admin:global').emit('auctionMonitor', {
      type: 'AUCTION_FORCE_ENDED',
      auctionId: auction.id,
      status: auction.status,
    });
  }

  emitPlatformStats(payload: Record<string, unknown>): void {
    this.server.to('admin:global').emit('platformStats', payload);
  }

  emitSuspiciousBidAlert(payload: Record<string, unknown>): void {
    this.server.to('admin:global').emit('suspiciousBidAlert', payload);
  }

  emitAuctionMonitor(payload: Record<string, unknown>): void {
    this.server.to('admin:global').emit('auctionMonitor', payload);
  }
}
