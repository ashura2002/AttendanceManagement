import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLeaveRequestDTO } from './dto/create-request.dto';
import { UsersService } from '../users/users.service';
import { LeaveType } from 'src/common/enums/leaveType.enum';
import { Roles } from 'src/common/enums/Roles.enum';
import { LeaveStatus, ResultStatus } from 'src/common/enums/leaveStatus.enum';
import { DecisionDTO } from './dto/decision.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(Request)
    private readonly leaveReqRepo: Repository<Request>,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  async createLeaveForm(
    userId: number,
    dto: CreateLeaveRequestDTO,
  ): Promise<Request> {
    const { startDate, endDate, leaveType } = dto;
    const user = await this.userService.findById(userId);

    // check if start and end date is valid
    if (new Date(endDate) < new Date(startDate))
      throw new BadRequestException('End date must be above on start date');

    // check leaveType if is valid or in the value of enums
    const validLeaveType = Object.values(LeaveType);
    if (!validLeaveType.includes(leaveType))
      throw new BadRequestException(`Invalid ${leaveType} as leave type.`);

    // for total days employees leave
    const totalDayLeave =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24) +
      1;

    // create request form
    const leaveRequest = this.leaveReqRepo.create({
      ...dto,
      totalLeaveDays: totalDayLeave,
      user,
    });
    return await this.leaveReqRepo.save(leaveRequest);
  }

  async getAllRequest(role: Roles): Promise<Request[]> {
    let whereCondition: any = {};
    if (role === Roles.Hr) {
      whereCondition = { views: LeaveStatus.Pending_HR };
    }

    if (role === Roles.ProgramHead) {
      whereCondition = { views: LeaveStatus.Pending_ProgramHead };
    }

    if (role === Roles.Admin) {
      whereCondition = { views: LeaveStatus.Pending_Admin };
    }
    const requestLeaveForm = await this.leaveReqRepo.find({
      where: whereCondition,
    });
    return requestLeaveForm;
  }

  async getOwnRequest(userId: number): Promise<Request[]> {
    const ownRequest = await this.leaveReqRepo.find({
      where: { user: { id: userId } },
    });
    return ownRequest;
  }

  async decision(
    requestID: number,
    userID: number,
    dto: DecisionDTO,
  ): Promise<Request> {
    const request = await this.leaveReqRepo.findOne({
      where: { id: requestID },
      relations: ['user'],
      select: {
        user: {
          id: true,
          displayName: true,
        },
      },
    });

    if (!request) throw new NotFoundException('Request not found');
    const approver = await this.userService.findById(userID);

    // hr
    if (approver.role === Roles.Hr) {
      if (dto.status === ResultStatus.Rejected) {
        request.finalStatus = ResultStatus.Rejected;
        request.views = LeaveStatus.Rejected_Request;
        // for employee
        await this.notificationService.createNotification({
          message: `Youre request was Rejected by ${Roles.Hr}`,
          user: request.user.id,
        });
        // for hr notif
        await this.notificationService.createNotification({
          message: `You rejected the request of ${request.user.displayName}`,
          user: approver.id,
        });
      } else {
        request.views = LeaveStatus.Pending_ProgramHead;
        // employee
        await this.notificationService.createNotification({
          message: `Your'e request was Approved by ${Roles.Hr} and pending approval for ${Roles.ProgramHead}`,
          user: request.user.id,
        });
        // notif for hr
        await this.notificationService.createNotification({
          message: `You approved the request of ${request.user.displayName}`,
          user: approver.id,
        });
      }
    }
    // proghead
    else if (approver.role === Roles.ProgramHead) {
      if (dto.status === ResultStatus.Rejected) {
        request.finalStatus = ResultStatus.Rejected;
        request.views = LeaveStatus.Rejected_Request;
        // for employee
        await this.notificationService.createNotification({
          message: `Youre request was Rejected by ${Roles.ProgramHead}`,
          user: request.user.id,
        });
        // for proghead notif
        await this.notificationService.createNotification({
          message: `You rejected the request of ${request.user.displayName}`,
          user: approver.id,
        });
      } else {
        request.views = LeaveStatus.Pending_Admin;
        // employee
        await this.notificationService.createNotification({
          message: `Your'e request was Approved by ${Roles.ProgramHead} and pending approval for ${Roles.Admin}`,
          user: request.user.id,
        });
        // notif for prghead
        await this.notificationService.createNotification({
          message: `You approved the request of ${request.user.displayName}`,
          user: approver.id,
        });
      }
    }
    // admin
    else if (approver.role === Roles.Admin) {
      if (dto.status === ResultStatus.Rejected) {
        request.finalStatus = ResultStatus.Rejected;
        request.views = LeaveStatus.Rejected_Request;
        // for employee
        await this.notificationService.createNotification({
          message: `Youre request was Rejected by ${Roles.Admin}`,
          user: request.user.id,
        });
        // for hr admin
        await this.notificationService.createNotification({
          message: `You rejected the request of ${request.user.displayName}`,
          user: approver.id,
        });
      } else {
        request.finalStatus = ResultStatus.Approved;
        request.views = LeaveStatus.Approved_Request;
        // employee
        await this.notificationService.createNotification({
          message: `Your'e request was Approved by ${Roles.Admin}`,
          user: request.user.id,
        });
        // notif for admin
        await this.notificationService.createNotification({
          message: `You approved the request of ${request.user.displayName}`,
          user: approver.id,
        });
      }
    } else {
      throw new BadRequestException(
        'You are not allowed to decide this request',
      );
    }

    return await this.leaveReqRepo.save(request);
  }
}
