import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subject-assignment/subject-assignment.service';
import { AttendanceOptions } from 'src/common/enums/AttendanceOptions.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => subjectAssignmentService))
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) {}

  async timeIn(userId: number): Promise<any> {
    const now = new Date();
    const employee = await this.userService.findById(userId);

    const subjectAssignList =
      await this.subjectAssignmentService.getOwnSubjectAssignmentByDate(
        userId,
        now,
      );

    if (!subjectAssignList.length) {
      throw new BadRequestException('You dont have subject assignment today');
    }

    // find the current sched using the 5 before and after start time on subject assignmnet
    const currentAssignment = subjectAssignList.find((sub) => {
      const startTime = this.toDateWithTime(now, sub.startTime);
      const fiveMinutes = 5 * 60 * 1000;

      const fiveMinBefore = new Date(startTime.getTime() - fiveMinutes);
      const fiveMinAfter = new Date(startTime.getTime() + fiveMinutes);

      return now >= fiveMinBefore && now <= fiveMinAfter;
    });

    if (!currentAssignment) {
      throw new BadRequestException(
        'No valid class to time in right now. You can time in only 5 minutes before/after start time.',
      );
    }

    //  CHECK IF ALREADY TIMEIN
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        subjectAssignment: { id: currentAssignment.subjectAssignmentID },
        date: now,
      },
    });

    if (existingAttendance?.timeIn) {
      throw new BadRequestException('You already timed in for this subject.');
    }

    const timeInString = now.toTimeString().split(' ')[0]; // "HH:mm:ss"

    // determine the attendance status
    const classStart = this.toDateWithTime(now, currentAssignment.startTime);

    let status = AttendanceOptions.Present;
    if (now > classStart) {
      status = AttendanceOptions.Late;
    }

    const attendance = this.attendanceRepository.create({
      date: now,
      timeIn: timeInString,
      attendanceStatus: status,
      user: employee,
      subjectAssignment: { id: currentAssignment.subjectAssignmentID },
    });

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Timed in successfully',
      status,
      timeIn: timeInString,
    };
  }

  async timeOut(userId: number): Promise<any> {
    const now = new Date();

    // find today attendance
    const attendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        date: now,
      },
      relations: ['subjectAssignment'],
    });

    if (!attendance) {
      throw new BadRequestException('No attendance record found for today.');
    }

    if (attendance.timeOut) {
      throw new BadRequestException('You already timed out.');
    }

    const assignment = attendance.subjectAssignment;

    // Convert endTime ("HH:mm") to Date object
    const endTimeDate = this.toDateWithTime(now, assignment.endTime);

    // Convert now to "HH:mm:ss"
    const timeOutString = now.toTimeString().split(' ')[0];

    // determine time out status
    let status = attendance.attendanceStatus; // keep existing (Present or Late)

    const diffMs = now.getTime() - endTimeDate.getTime();
    const diffMins = diffMs / (1000 * 60);

    if (now < endTimeDate) {
      status = AttendanceOptions.LeftEarly;
    } else if (diffMins >= 30) {
      // 30+ mins late = OVERTIME
      status = AttendanceOptions.Present;
    } else {
      // Out exactly on time (within 30 mins)
      status = AttendanceOptions.Present;
    }

    // calcutlate the totalhours
    const timeInDate = this.combineDateAndTime(
      attendance.date,
      attendance.timeIn,
    );
    const totalHours =
      (now.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);

    attendance.timeOut = timeOutString;
    attendance.totalHours = Number(totalHours.toFixed(2));
    attendance.attendanceStatus = status;

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Timed out successfully',
      timeOut: timeOutString,
      status,
      totalHours: attendance.totalHours,
    };
  }

  private combineDateAndTime(dateOnly: Date, timeString: string): Date {
    const [h, m, s] = timeString.split(':').map(Number);
    const d = new Date(dateOnly);
    d.setHours(h, m, s ?? 0, 0);
    return d;
  }

  private toDateWithTime(baseDate: Date, timeString: string): Date {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const dt = new Date(baseDate);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  }

  async checkAttendanceToday(userId: number, date: Date): Promise<any> {
    const attendance = await this.attendanceRepository.find({
      where: {
        user: { id: userId },
        date: date,
      },
      relations: ['subjectAssignment'],
      order: {
        subjectAssignment: { startTime: 'ASC' },
      },
    });

    return attendance;
  }
}
// To do ->
// get all attendance for attendance log
// qr scan for admins
// fix return response sa mga na nested objects
