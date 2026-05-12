import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';
import {
  CreateEventResponse,
  UpdateEventResponse,
  DeleteEventResponse,
} from '@hub/event-data';
import { User } from '@hub/user-api';
import { CurrentUser } from '@hub/auth-api';

@Controller('event')
export class EventController {
  @Inject(EventService)
  private readonly _eventService!: EventService;

  @Get()
  getEvents(@CurrentUser() user: User) {
    return this._eventService.getEvents(user);
  }

  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ): Promise<CreateEventResponse> {
    return await this._eventService.createEvent(user, createEventDto);
  }

  @Patch(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ): Promise<UpdateEventResponse> {
    return await this._eventService.updateEvent(user, id, updateEventDto);
  }

  @Delete(':id')
  async deleteEvent(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<DeleteEventResponse> {
    return await this._eventService.deleteEvent(user, { id });
  }

  @Get(':id')
  getEvent(@Param('id') id: string, @CurrentUser() user: User) {
    return this._eventService.getEvent(user, id);
  }
}
