import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Remarks } from 'src/common/enums/remarkOptions.enum';
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

  async timeIn(userId: number): Promise<any> {
    // const dateNow = new Date();
    // const employee = await this.userService.findById(userId);
    // const assignSubject =
    //   await this.subjectAssignmentService.getOwnSubjectAssignmentByDate(
    //     userId,
    //     dateNow,
    //   );

    // return { employee, assignSubject };
  }
}
