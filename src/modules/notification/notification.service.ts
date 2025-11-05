import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.user.id !== userId)
      throw new BadRequestException(
        'You can only allow to modify your own notifications',
      );
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async deleteNotification(id: number, userId: number): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!notification) throw new NotFoundException('Notification not found!');
    if (notification.user.id !== userId)
      throw new BadRequestException(
        `You can only delete your own notifications`,
      );
    await this.notificationRepo.remove(notification);
  }
}
