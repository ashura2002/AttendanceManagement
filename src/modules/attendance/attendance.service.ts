import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AssignmentService } from '../assignments/assignment.service';
import { Remarks } from 'src/common/enums/remarkOptions.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: AssignmentService,
  ) {}

  async timeIn():Promise<any>{
    
  }
}
