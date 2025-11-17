import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subjectAssignment/subjectAssignment.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) {}

  async timeIn(userId: number): Promise<any> {
    const dateNow = new Date();
    const employee = await this.userService.findById(userId);
    const getTodaySchedule = await this.subjectAssignmentService.getLoadsByDate(
      employee.id,
      dateNow,
    );

    if (!getTodaySchedule.length)
      throw new BadRequestException(
        `You can't attendance you have no subject on this time`,
      );

      

    return { employee, getTodaySchedule };
  }
}
