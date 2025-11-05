import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  @HttpCode(HttpStatus.CREATED)
  async createNotif(
    @Body() createNotifDTO: CreateNotificationDTO,
  ): Promise<Notification> {
    return await this.notifService.createNotification(createNotifDTO);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getOwnNotification(@Req() req): Promise<Notification[]> {
    const { userId } = req.user;
    return this.notifService.getOwnNotification(userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<Notification> {
    const { userId } = req.user;
    return this.notifService.markAsRead(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeNotification(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const { userId } = req.user;
    await this.notifService.deleteNotification(id, userId);
  }
}
