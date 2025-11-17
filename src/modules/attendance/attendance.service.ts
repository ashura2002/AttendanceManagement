import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subjectAssignment/subjectAssignment.service';
import { Remarks } from 'src/common/enums/remarkOptions.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) { }

  async timeIn(userId: number): Promise<any> {
    const dateNow = new Date();
    const employee = await this.userService.findById(userId);
    const todaySchedule = await this.subjectAssignmentService.getLoadsByDate(
      employee.id,
      dateNow,
    );

    if (!todaySchedule.length)
      throw new BadRequestException(
        `You can't attendance you have no subject on this time`,
      );

    const closestShed = todaySchedule[0];
    if (!closestShed)
      throw new BadRequestException(
        'No subject assignment found for attendance',
      );
    const [hours, minutes, seconds] = closestShed.startTime
      .split(':')
      .map(Number);
    const startTime = new Date(dateNow);
    startTime.setHours(hours, minutes, seconds, 0);
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    // early attendance 5 minutes
    const earlyWindow = new Date(startTime.getTime() - FIVE_MINUTES_MS);
    // late attendance 5 mins after start time
    const lateWindow = new Date(startTime.getTime() + FIVE_MINUTES_MS);

    let attendance: any = {};

    if (
      dateNow.getTime() >= earlyWindow.getTime() &&
      dateNow.getTime() <= lateWindow.getTime()
    ) {
      attendance = this.attendanceRepo.create({
        subjectAssignment: closestShed,
        timeIn: dateNow.toLocaleTimeString(),
        user: employee,
        status: Remarks.Present,
      });

      const subjectAssignment =
        await this.subjectAssignmentService.findSubjectAssignmentById(userId);
      const newRemarksForSubject = {
        ...subjectAssignment,
        remarks: Remarks.Present,
      };

      const newAttendance = {
        ...attendance,
        subjectAssignment: newRemarksForSubject,
      };

      return newAttendance;
    } else if (dateNow.getTime() > lateWindow.getTime()) {
      throw new BadRequestException(
        `Time in is close at ${lateWindow.toLocaleTimeString()}`,
      );
    }
  }
}
