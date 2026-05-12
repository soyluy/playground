import { Module } from '@nestjs/common';
import { EventController } from './event/event.controller';
import { EventService } from './event/event.service';
import { PrismaModule } from '@hub/prisma';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [PrismaModule],
})
export class EventModule {}
