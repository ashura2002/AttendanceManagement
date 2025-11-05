import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Post()
  async createNotif(
    @Body() createNotifDTO: CreateNotificationDTO,
  ): Promise<Notification> {
    return await this.notifService.createNotification(createNotifDTO);
  }

  @Get('me')
  async getOwnNotification(@Req() req): Promise<Notification[]> {
    const { userId } = req.user;
    return this.notifService.getOwnNotification(userId);
  }

  @Patch(':id')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Notification> {
    return this.notifService.markAsRead(id);
  }
}
// to do -> add a delete notifications
