import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Inject,
  Injectable,
  Logger,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { BidService } from '../modules/bid/bid.service';
import { AutoBidService } from '../modules/bid/auto-bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { SetAutoBidDto } from './dto/set-auto-bid.dto';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuctionGateway } from './auction.gateway';

@Injectable()
@WebSocketGateway({
  namespace: '/bid',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class BidGateway {
  @WebSocketServer()
  server!: Server;

  private readonly _logger = new Logger(BidGateway.name);

  constructor(
    private readonly _bidService: BidService,
    private readonly _autoBidService: AutoBidService,
    @Inject(forwardRef(() => AuctionGateway))
    private readonly _auctionGateway: AuctionGateway,
  ) {}

  @SubscribeMessage('placeBid')
  async placeBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: PlaceBidDto,
  ): Promise<void> {
    const user = client.data.user as { id: string };
    const room = `auction:${dto.auctionId}`;

    try {
      this.server.to(client.id).emit('bidPlacedResult', {
        success: true,
        auctionId: dto.auctionId,
        amount: dto.amount,
      });

      const bid = await this._bidService.placeBid(dto.auctionId, user.id, dto.amount, {
        ipAddress: client.handshake.address ?? '127.0.0.1',
        userAgent: (client.handshake.headers['user-agent'] as string | undefined) ?? null,
      });

      this.server.to(room).emit('bidPlaced', {
        bidId: bid.id,
        auctionId: dto.auctionId,
        bidderId: user.id,
        amount: bid.amount,
        createdAt: bid.createdAt,
      });
      this._auctionGateway.emitAuctionUpdated(dto.auctionId, {
        currentPrice: bid.amount,
        winnerId: user.id,
      });
    } catch (error) {
      this._logger.warn(
        `placeBid failed socket=${client.id} auction=${dto.auctionId} message=${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
      this.server.to(client.id).emit('bidPlacedResult', {
        success: false,
        message: error instanceof Error ? error.message : 'Bid placement failed',
      });
    }
  }

  @SubscribeMessage('setAutoBid')
  async setAutoBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SetAutoBidDto,
  ): Promise<void> {
    const user = client.data.user as { id: string };

    try {
      const autoBid = await this._autoBidService.setAutoBid(
        dto.auctionId,
        user.id,
        dto.maxAmount,
      );

      this.server.to(client.id).emit('setAutoBidResult', {
        success: true,
        auctionId: dto.auctionId,
        maxAmount: autoBid.maxAmount,
      });
    } catch (error) {
      this.server.to(client.id).emit('setAutoBidResult', {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to set auto bid',
      });
    }
  }

  @SubscribeMessage('cancelAutoBid')
  async cancelAutoBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: Pick<SetAutoBidDto, 'auctionId'>,
  ): Promise<void> {
    const user = client.data.user as { id: string };

    try {
      await this._autoBidService.cancelAutoBid(dto.auctionId, user.id);
      this.server.to(client.id).emit('cancelAutoBidResult', {
        success: true,
        auctionId: dto.auctionId,
      });
    } catch (error) {
      this.server.to(client.id).emit('cancelAutoBidResult', {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to cancel auto bid',
      });
    }
  }
}
