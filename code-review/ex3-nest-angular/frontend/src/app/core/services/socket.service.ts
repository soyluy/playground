import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { AuthService } from './auth.service';
import { SOCKET_EVENTS } from '../constants/socket.constants';
import { SOCKET_IO_URL } from '../../app.config';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly _authService = inject(AuthService);
  private readonly _socketUrl = inject(SOCKET_IO_URL);

  private _socket: Socket | null = null;
  readonly connectionStatus = signal<ConnectionStatus>('disconnected');
  readonly isConnected = computed(() => this.connectionStatus() === 'connected');

  connect(namespace: 'auction' | 'bid' | 'notification' | 'admin' = 'auction'): Socket {
    this.connectionStatus.set('connecting');
    const token = this._authService.accessToken();

    this._socket = io(`${this._socketUrl}/${namespace}`, {
      transports: ['websocket'],
      withCredentials: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    this._socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.connectionStatus.set('connected');
      this.authenticate();
    });

    this._socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      this.connectionStatus.set('disconnected');
    });

    this._socket.on(SOCKET_EVENTS.RECONNECT, () => {
      this.connectionStatus.set('connected');
      this.authenticate();
    });

    this._socket.on(SOCKET_EVENTS.UNAUTHORIZED, async () => {
      const accessToken = await this._authService.refreshToken().toPromise();
      if (!accessToken) {
        this.disconnect();
        return;
      }

      this.authenticate();
    });

    return this._socket;
  }

  disconnect(): void {
    this._socket?.disconnect();
    this.connectionStatus.set('disconnected');
  }

  authenticate(): void {
    const token = this._authService.accessToken();
    if (!token || !this._socket) {
      return;
    }

    this._socket.emit(SOCKET_EVENTS.AUTHENTICATE, {
      token: `Bearer ${token}`,
    });
  }

  joinAuction(auctionId: string): void {
    this.emit(SOCKET_EVENTS.JOIN_AUCTION, { auctionId });
  }

  leaveAuction(auctionId: string): void {
    this.emit(SOCKET_EVENTS.LEAVE_AUCTION, { auctionId });
  }

  on<T>(eventName: string): Observable<T> {
    if (!this._socket) {
      this.connect();
    }

    return fromEvent<T>(this._socket as Socket, eventName);
  }

  emit<TPayload extends object>(eventName: string, payload?: TPayload): void {
    if (!this._socket) {
      this.connect();
    }

    (this._socket as Socket).emit(eventName, payload);
  }
}
