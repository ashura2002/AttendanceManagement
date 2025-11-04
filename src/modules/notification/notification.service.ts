import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async createNotification(
    createNotifDTO: CreateNotificationDTO,
  ): Promise<Notification> {
    const { user, message } = createNotifDTO;
    const users = await this.userService.findById(user);
    const notification = this.notificationRepo.create({
      user: users,
      message: message,
    });
    return this.notificationRepo.save(notification);
  }

  async getOwnNotification(userId: number): Promise<Notification[]> {
    const myNotification = await this.notificationRepo.find({
      where: { user: { id: userId } },
    });
    return myNotification;
  }
}
