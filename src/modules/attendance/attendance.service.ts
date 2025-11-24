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
import { formatTime } from 'src/common/helper/timeConverter';
import { AttendanceLogResponse } from './types/attendanceLogResponse.types';

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

  async getOwnAttendanceLog(
    userId: number,
    yearMonth: Date,
  ): Promise<AttendanceLogResponse[]> {
    const selectedDate = new Date(yearMonth);
    const year = selectedDate.getFullYear();
    const months = selectedDate.getMonth() + 1;

    // console.log({ types: typeof selectedDate, year: year, month: months });

    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.user =:userId', { userId })
      .leftJoin('attendance.subjectAssignment', 'subjectAssignment')
      .leftJoin('subjectAssignment.subject', 'subject')
      .select(['attendance', 'subjectAssignment', 'subject'])
      .andWhere('EXTRACT(YEAR FROM attendance.date) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM attendance.date) = :months', { months })
      .getMany();

    const mappedAttendance = attendance.map((a) => {
      const attendanceResponseStructure = {
        id: a.id,
        date: a.date,
        timeIn: formatTime(a.timeIn),
        timeOut: formatTime(a.timeOut),
        totalHours: a.totalHours,
        attendanceStatus: a.attendanceStatus,
        subjectName: a.subjectAssignment.subject.subjectName,
      };
      return attendanceResponseStructure;
    });

    return mappedAttendance;
  }

  async getEmployeesAttendanceLog(
    yearMonth: Date,
  ): Promise<AttendanceLogResponse[]> {
    const selectedDate = new Date(yearMonth);
    const year = selectedDate.getFullYear();
    const months = selectedDate.getMonth() + 1;

    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.subjectAssignment', 'subjectAssignment')
      .leftJoin('subjectAssignment.subject', 'subject')
      .select(['attendance', 'user', 'subjectAssignment', 'subject'])
      .andWhere('EXTRACT(YEAR FROM attendance.date) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM attendance.date) = :months', { months })
      .getMany();

    const mappedAttendance = attendance.map((a) => {
      const attendanceResponseStructure = {
        id: a.id,
        date: a.date,
        timeIn: a.timeIn,
        timeOut: a.timeOut,
        totalHours: a.totalHours,
        attendanceStatus: a.attendanceStatus,
        subjectName: a.subjectAssignment.subject.subjectName,
        user: a.user.displayName,
      };
      return attendanceResponseStructure;
    });

    return mappedAttendance;
  }

  async scanQr(employeeId: number): Promise<any> {
    // check user
    const employee = await this.userService.findById(employeeId);

    const now = new Date();
    const localNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
    );

    // Get today's sub assignment
    const assignments =
      await this.subjectAssignmentService.getOwnSubjectAssignmentByDate(
        employeeId,
        localNow,
      );

    if (!assignments.length) {
      throw new BadRequestException('No assignments found for today.');
    }

    // Find ACTIVE assignment (5 min before/after start, ends at endTime)
    const fiveMinutes = 5 * 60 * 1000; // 5 min buffer
    const activeAssignment = assignments.find((sub) => {
      const start = this.toDateWithTime(localNow, sub.startTime);
      const end = this.toDateWithTime(localNow, sub.endTime);

      return (
        localNow.getTime() >= start.getTime() - fiveMinutes &&
        localNow.getTime() <= end.getTime() + fiveMinutes
      );
    });

    if (!activeAssignment) {
      throw new BadRequestException(
        'No active class schedule for this employee right now.',
      );
    }

    // Check if attendance already exists today
    const existing = await this.attendanceRepository.findOne({
      where: {
        user: { id: employeeId },
        subjectAssignment: { id: activeAssignment.subjectAssignmentID },
        date: localNow,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Attendance for this subject has already been recorded today.',
      );
    }

    // Create Time-In based on schedule
    const classStart = this.toDateWithTime(
      localNow,
      activeAssignment.startTime,
    );

    const timeInStr = classStart.toTimeString().split(' ')[0];

    const attendance = this.attendanceRepository.create({
      date: localNow,
      timeIn: timeInStr,
      attendanceStatus: AttendanceOptions.Present,
      user: employee,
      subjectAssignment: { id: activeAssignment.subjectAssignmentID },
    });

    await this.attendanceRepository.save(attendance);

    const responseShape = {
      message: 'Attendance Succesfully Recorded',
      scanTime: localNow,
      employee: employee.displayName,
      attendance: attendance,
    };

    // Return success response
    return responseShape;
  }

  async scanQrTimeOut(employeeId: number): Promise<any> {
    await this.userService.findById(employeeId);

    const now = new Date();
    const localNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
    );
    // find the attendance today
    const attendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: employeeId },
        date: localNow,
      },
      relations: ['subjectAssignment'],
    });

    if (!attendance || !attendance.timeIn) {
      throw new BadRequestException('No Time-In record found for today.');
    }

    if (attendance.timeOut) {
      throw new BadRequestException('Time-Out has already been recorded.');
    }

    // get sched time
    const classEnd = this.toDateWithTime(
      localNow,
      attendance.subjectAssignment.endTime,
    );

    const timeOutStr = localNow.toTimeString().split(' ')[0];

    // Calculate total hours
    const timeInDate = this.combineDateAndTime(
      attendance.date,
      attendance.timeIn,
    );
    const totalHours =
      (localNow.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);

    // determine attendance status
    let status = attendance.attendanceStatus; // keep existing (Present or Late)
    if (localNow < classEnd) {
      status = AttendanceOptions.LeftEarly;
    } else if (!attendance.timeOut) {
      status = AttendanceOptions.NoTimeOut;
    } else {
      status = AttendanceOptions.Present;
    }

    // Update attendance record
    attendance.timeOut = timeOutStr;
    attendance.totalHours = Number(totalHours.toFixed(2));
    attendance.attendanceStatus = status;

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Time-Out successfully recorded',
      timeOut: timeOutStr,
      totalHours: attendance.totalHours,
      attendanceStatus: status,
    };
  }
}
