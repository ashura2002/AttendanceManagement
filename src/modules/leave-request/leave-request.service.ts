import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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

    const firstApprover = await this.userService.findUserByRole(Roles.Hr);
    // requester notif
    await this.notificationService.createNotification({
      message: `Your request is pending for approval from ${firstApprover.role}`,
      user: userId,
    });

    // notif for next approver
    await this.notificationService.createNotification({
      message: `You have pending request approval by ${user.displayName}`,
      user: firstApprover.id,
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

    // Determine next approver dynamically
    let nextApprover: any = null;
    if (approver.role === Roles.Hr) {
      nextApprover = await this.userService.findUserByRole(Roles.ProgramHead);
    } else if (approver.role === Roles.ProgramHead) {
      nextApprover = await this.userService.findUserByRole(Roles.Admin);
    }

    const employee = request.user;
    const approverRole = approver.role;

    // Helper function for notifications
    const notify = async (message: string, userID: number) => {
      await this.notificationService.createNotification({
        message,
        user: userID,
      });
    };

    // HR DECISION
    if (approverRole === Roles.Hr) {
      if (dto.status === ResultStatus.Rejected) {
        request.finalStatus = ResultStatus.Rejected;
        request.views = LeaveStatus.Rejected_Request;
        request.hr = ResultStatus.Rejected;
        // requester na notif
        await notify(`Your request was Rejected by ${Roles.Hr}`, employee.id);
        // the current approver notif
        await notify(
          `You rejected the request of ${employee.displayName}`,
          approver.id,
        );
      } else {
        request.hr = ResultStatus.Approved;
        request.views = LeaveStatus.Pending_ProgramHead;
        // requester na notif
        await notify(
          `Your request was Approved by ${Roles.Hr} and pending approval for ${Roles.ProgramHead}`,
          employee.id,
        );
        // the current approver notif
        await notify(
          `You approved the request of ${employee.displayName}`,
          approver.id,
        );
        // next approver notif
        await notify(
          `You have a pending request of approval from ${employee.displayName}`,
          nextApprover.id,
        );
      }
    }

    // PROGRAM HEAD DECISION
    else if (approverRole === Roles.ProgramHead) {
      if (dto.status === ResultStatus.Rejected) {
        request.finalStatus = ResultStatus.Rejected;
        request.views = LeaveStatus.Rejected_Request;
        request.programhead = ResultStatus.Rejected;
        await notify(
          `Your request was Rejected by ${Roles.ProgramHead}`,
          employee.id,
        );
        await notify(
          `You rejected the request of ${employee.displayName}`,
          approver.id,
        );
      } else {
        request.views = LeaveStatus.Pending_Admin;
        request.programhead = ResultStatus.Approved;
        await notify(
          `Your request was Approved by ${Roles.ProgramHead} and pending approval for ${Roles.Admin}`,
          employee.id,
        );
        await notify(
          `You approved the request of ${employee.displayName}`,
          approver.id,
        );
        await notify(
          `You have a pending request of approval from ${employee.displayName}`,
          nextApprover.id,
        );
      }
    }

    //  ADMIN DECISION
    else if (approverRole === Roles.Admin) {
      if (dto.status === ResultStatus.Rejected) {
        request.finalStatus = ResultStatus.Rejected;
        request.views = LeaveStatus.Rejected_Request;
        request.admin = ResultStatus.Rejected;
        await notify(
          `Your request was Rejected by ${Roles.Admin}`,
          employee.id,
        );
        await notify(
          `You rejected the request of ${employee.displayName}`,
          approver.id,
        );
      } else {
        request.finalStatus = ResultStatus.Approved;
        request.views = LeaveStatus.Approved_Request;
        request.admin = ResultStatus.Approved;
        await notify(
          `Your request was fully approved by ${Roles.Admin}`,
          employee.id,
        );
        await notify(
          `You approved the request of ${employee.displayName}`,
          approver.id,
        );
      }
    } else {
      throw new BadRequestException(
        'You are not allowed to decide on this request',
      );
    }

    return await this.leaveReqRepo.save(request);
  }

  async deleteOwnRequest(requestID: number): Promise<void> {
    const request = await this.leaveReqRepo.findOne({
      where: { id: requestID },
    });
    if (!request) throw new NotFoundException('Request not found');
    await this.leaveReqRepo.remove(request);
  }

  async getAllApprovedRequest(): Promise<Request[]> {
    const approvedRequest = await this.leaveReqRepo.find({
      where: { finalStatus: ResultStatus.Approved },
    });
    return approvedRequest;
  }

  async getAllRejectedRequest(): Promise<Request[]> {
    const rejectedRequest = await this.leaveReqRepo.find({
      where: { finalStatus: ResultStatus.Rejected },
    });
    return rejectedRequest;
  }

  async findOnLeaveEmployee(userId: number): Promise<any> {
    const onLeaveUsers = await this.leaveReqRepo
      .createQueryBuilder('leave')
      .leftJoin('leave.user', 'user')
      .where('leave.user =:userId', { userId })
      .andWhere('leave.finalStatus =:finalStatus', {
        finalStatus: ResultStatus.Approved,
      })
      .getMany();
    return onLeaveUsers;
  }
}
