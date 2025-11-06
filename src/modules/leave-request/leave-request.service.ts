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
  ): Promise<any> {
    const { startDate, endDate, leaveType } = dto;
    const user = await this.userService.findById(userId);

    // check f the start and end date is valid
    if (new Date(endDate) < new Date(startDate))
      throw new BadRequestException(
        'End date cannot be earlier than start date',
      );

    // check if leave type is valid value or in an enums
    const validLeaveType = Object.values(LeaveType);
    if (!validLeaveType.includes(leaveType))
      throw new BadRequestException(`Invalid ${leaveType} as leave type`);

    // create request
    const leaveRequest = this.leaveReqRepo.create({
      ...dto,
      user,
    });
    return await this.leaveReqRepo.save(leaveRequest);
  }
}
// to do -> Create Leave request module endpoints - DONE
//       -> add delete own request - employee only
//       -> view own request -> employee -> view all
//       -> approval flow from hr to admin
