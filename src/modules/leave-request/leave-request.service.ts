import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLeaveRequestDTO } from './dto/create-request.dto';
import { UsersService } from '../users/users.service';
import { LeaveType } from 'src/common/enums/leaveType.enum';
import { LeaveStatus } from 'src/common/enums/leaveStatus.enum';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(Request)
    private readonly leaveReqRepo: Repository<Request>,
    private readonly userService: UsersService,
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

  async getOwnRequest(userId: number): Promise<Request[]> {
    const ownRequest = await this.leaveReqRepo.find({
      where: { user: { id: userId } },
    });
    return ownRequest;
  }

  async getAllRequestAdminAndHR(): Promise<Request[]> {
    const requests = await this.leaveReqRepo.find({
      relations: ['user'],
      select: {
        user: {
          displayName: true,
        },
      },
    });
    return requests;
  }
}

// to do -> Create Leave request module endpoints - DONE
//       -> view own request -> employee -> view all - DONE
//       -> add delete own request - employee only 
//       -> approval flow from hr to admin
