import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly _userToSocket = new Map<string, string>();
  private readonly _socketToUser = new Map<string, string>();
  private readonly _onlineUsers = new Map<string, { connectedAt: Date; meta: Record<string, unknown> }>();

  trackConnection(userId: string, socketId: string): void {
    this._userToSocket.set(userId, socketId);
    this._socketToUser.set(socketId, userId);
    this._onlineUsers.set(userId, { connectedAt: new Date(), meta: {} });
  }

  trackDisconnection(userId: string, socketId: string): void {
    const current = this._userToSocket.get(userId);
    if (current && current !== socketId) {
      this._socketToUser.delete(socketId);
      return;
    }

    this._userToSocket.delete(userId);
    this._socketToUser.delete(socketId);
    this._onlineUsers.delete(userId);
  }

  isOnline(userId: string): boolean {
    return this._userToSocket.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this._onlineUsers.keys());
  }

  getUserSocket(userId: string): string | null {
    return this._userToSocket.get(userId) ?? null;
  }

  getAllConnectionsForUser(userId: string): string[] {
    const socketId = this._userToSocket.get(userId);
    return socketId ? [socketId] : [];
  }
}
