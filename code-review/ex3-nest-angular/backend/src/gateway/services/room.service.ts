import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class RoomService {
  private readonly _rooms: Record<string, string[]> = {};
  private readonly _userRooms: Record<string, string[]> = {};

  joinRoom(client: Socket, room: string): void {
    client.join(room);
    const sockets = this._rooms[room] ?? [];
    if (!sockets.includes(client.id)) {
      sockets.push(client.id);
    }
    this._rooms[room] = sockets;

    const userId = (client.data?.user?.id as string | undefined) ?? client.id;
    const userRooms = this._userRooms[userId] ?? [];
    if (!userRooms.includes(room)) {
      userRooms.push(room);
    }
    this._userRooms[userId] = userRooms;
  }

  leaveRoom(client: Socket, room: string): void {
    client.leave(room);

    const sockets = this._rooms[room] ?? [];
    this._rooms[room] = sockets.filter((socketId) => socketId !== client.id);
    if (this._rooms[room].length === 0) {
      delete this._rooms[room];
    }

    const userId = (client.data?.user?.id as string | undefined) ?? client.id;
    const userRooms = this._userRooms[userId] ?? [];
    this._userRooms[userId] = userRooms.filter((entry) => entry !== room);
  }

  leaveAllRooms(client: Socket): void {
    const userId = (client.data?.user?.id as string | undefined) ?? client.id;
    const rooms = this._userRooms[userId] ?? [];
    for (const room of rooms) {
      this.leaveRoom(client, room);
    }
  }

  getRoomSize(room: string): number {
    return (this._rooms[room] ?? []).length;
  }

  getUserRooms(userId: string): string[] {
    return this._userRooms[userId] ?? [];
  }

  getRoomUsers(room: string): string[] {
    return this._rooms[room] ?? [];
  }

  broadcastToRoom(
    server: Server,
    room: string,
    event: string,
    payload: Record<string, unknown>,
    excludeUserId?: string,
  ): void {
    if (!excludeUserId) {
      server.to(room).emit(event, payload);
      return;
    }

    const socketIds = this._rooms[room] ?? [];
    for (const socketId of socketIds) {
      if (socketId === excludeUserId) {
        continue;
      }
      server.to(socketId).emit(event, payload);
    }
  }

  broadcastToUser(
    server: Server,
    userId: string,
    event: string,
    payload: Record<string, unknown>,
  ): void {
    server.to(`user:${userId}`).emit(event, payload);
  }
}
