import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@hub/prisma';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  DeleteEventDto,
  EventItem,
  GetEventsResponse,
} from '@hub/event-data';
import { User } from '@hub/user-api';

@Injectable()
export class EventService {
  @Inject(PrismaService)
  private readonly _prismaService!: PrismaService;

  async createEvent(
    user: User,
    createEventDto: CreateEventDto,
  ): Promise<EventItem> {
    return this._prismaService.event.create({
      data: {
        userId: user.id,
        title: createEventDto.title,
        description: createEventDto.description ?? undefined,
        startTime: createEventDto.startTime,
        endTime: createEventDto.endTime ?? undefined,
      },
    });
  }

  async getEvents(user: User): Promise<GetEventsResponse> {
    const events = await this._prismaService.event.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'asc' },
    });

    const total = await this._prismaService.event.count({
      where: { userId: user.id },
    });

    return { data: events, total };
  }

  async getEvent(user: User, id: string): Promise<EventItem | null> {
    return this._prismaService.event.findUnique({
      where: { id, userId: user.id },
    });
  }

  async updateEvent(
    user: User,
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<EventItem> {
    const existing = await this._prismaService.event.findUnique({
      where: { id, userId: user.id },
    });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    return this._prismaService.event.update({
      where: { id, userId: user.id },
      data: {
        title: updateEventDto.title ?? undefined,
        description: updateEventDto.description ?? undefined,
        startTime: updateEventDto.startTime ?? undefined,
        endTime: updateEventDto.endTime ?? undefined,
      },
    });
  }

  async deleteEvent(
    user: User,
    deleteEventDto: DeleteEventDto,
  ): Promise<EventItem> {
    return this._prismaService.event.delete({
      where: { id: deleteEventDto.id, userId: user.id },
    });
  }
}
