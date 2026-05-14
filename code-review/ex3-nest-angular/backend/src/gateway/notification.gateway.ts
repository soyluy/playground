import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { NotificationService } from '../modules/notification/notification.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { RoomService } from './services/room.service';

@Injectable()
@WebSocketGateway({
  namespace: '/notification',
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly _notificationService: NotificationService,
    private readonly _roomService: RoomService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const user = client.data.user as { id: string } | undefined;
    if (!user?.id) {
      client.disconnect(true);
      return;
    }

    this._roomService.joinRoom(client, `user:${user.id}`);
    const unreadCount = await this._notificationService.getUnreadCount(user.id);
    this.server.to(client.id).emit('unreadCountUpdated', { unreadCount });
  }

  @SubscribeMessage('markNotificationRead')
  async markNotificationRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: { notificationId: string },
  ): Promise<void> {
    const user = client.data.user as { id: string };
    await this._notificationService.markAsRead(dto.notificationId);
    const unreadCount = await this._notificationService.getUnreadCount(user.id);
    this.server.to(client.id).emit('unreadCountUpdated', { unreadCount });
  }

  @SubscribeMessage('getUnreadCount')
  async getUnreadCount(@ConnectedSocket() client: Socket): Promise<void> {
    const user = client.data.user as { id: string };
    const unreadCount = await this._notificationService.getUnreadCount(user.id);
    this.server.to(client.id).emit('unreadCountUpdated', { unreadCount });
  }

  emitNewNotification(userId: string, payload: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('newNotification', payload);
  }
}
