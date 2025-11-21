import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subject-assignment/subject-assignment.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) {}

  async checkAttendanceToday(userId: number, date: Date): Promise<any> {}
}
