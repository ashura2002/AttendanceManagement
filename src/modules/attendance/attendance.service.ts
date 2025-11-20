import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subject-assignment/subject-assignment.service';
import { AttendanceOptions } from 'src/common/enums/AttendanceOptions.enum';
import { Remarks } from 'src/common/enums/remarkOptions.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) {}

  async timeIn(userId: number): Promise<any> {
    const now = new Date();
    const currentDate = new Date(now.toDateString()); // Extract date part only
    const currentTime = now.toTimeString().split(' ')[0]; // Get HH:mm:ss format

    // user and there assignment today
    const employee = await this.userService.findById(userId);
    const assignmentSubjects =
      await this.subjectAssignmentService.getOwnSubjectAssignmentByDate(
        employee.id,
        currentDate,
      );

    // checking for user if have an assignment
    if (!assignmentSubjects || assignmentSubjects.length === 0) {
      throw new BadRequestException('No subject assignments found for today');
    }

    // getting the first current subject assignment
    const subjectAssignment = assignmentSubjects[0];

    // Calculate attendance status based on current time and schedule
    const { status, remarks } = this.calculateAttendanceStatus(
      subjectAssignment,
      currentTime,
      currentDate,
    );

    // chcking if the user is already time in to avouid duplicate
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        subjectAssignment: { id: subjectAssignment.id },
        date: currentDate,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        'Already clocked in for this subject today',
      );
    }

    // Create new attendance record with calculated status
    const attendance = this.attendanceRepository.create({
      date: currentDate,
      timeIn: currentTime,
      attendanceStatus: status,
      remarks: remarks,
      subjectAssignment: subjectAssignment,
      user: employee,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    return {
      message: 'Successfully clocked in',
      attendance: savedAttendance,
    };
  }

  async timeOut(userId: number): Promise<any> {
    const now = new Date();
    const currentDate = new Date(now.toDateString()); // Extract date part only
    const currentTime = now.toTimeString().split(' ')[0]; // Get HH:mm:ss format

    // find all attendance user today
    const todaysAttendances = await this.attendanceRepository.find({
      where: {
        user: { id: userId },
        date: currentDate,
      },
      relations: ['subjectAssignment', 'subjectAssignment.subject'],
    });

    // checking if the user is have an attendance
    if (!todaysAttendances || todaysAttendances.length === 0) {
      throw new BadRequestException('No clock-in record found for today');
    }

    // Prefer records without time-out, fallback to first record
    const attendanceToUpdate =
      todaysAttendances.find((att) => !att.timeOut) || todaysAttendances[0];

    // Prevent duplicate clock-out
    if (attendanceToUpdate.timeOut) {
      throw new BadRequestException('Already clocked out for today');
    }

    // Calculate total hours worked
    const timeIn = new Date(
      `${currentDate.toDateString()} ${attendanceToUpdate.timeIn}`,
    );
    const timeOut = new Date(`${currentDate.toDateString()} ${currentTime}`);
    const totalHours =
      (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours

    // Determine remarks based on clock-out time relative to scheduled end time
    const remarks = this.calculateTimeOutRemarks(
      attendanceToUpdate.subjectAssignment.endTime,
      currentTime,
    );

    // Update attendance record with clock-out details
    attendanceToUpdate.timeOut = currentTime;
    attendanceToUpdate.totalHours = parseFloat(totalHours.toFixed(2)); // Round to 2 decimal places
    attendanceToUpdate.remarks = remarks;

    const updatedAttendance =
      await this.attendanceRepository.save(attendanceToUpdate);

    return {
      message: 'Successfully clocked out',
      attendance: updatedAttendance,
    };
  }

  private calculateTimeOutRemarks(
    scheduledEndTime: string,
    actualTimeOut: string,
  ): Remarks {
    // Convert time strings to minutes for numerical comparison
    const scheduledEndMinutes = this.timeToMinutes(scheduledEndTime);
    const actualTimeOutMinutes = this.timeToMinutes(actualTimeOut);

    const earlyOutThreshold = 5; // 5 minutes before scheduled end time
    const overtimeThreshold = 5; // 5 minutes after scheduled end time

    // Determine remarks based on time comparison with thresholds
    if (actualTimeOutMinutes < scheduledEndMinutes - earlyOutThreshold) {
      return Remarks.EarlyOut;
    } else if (actualTimeOutMinutes > scheduledEndMinutes + overtimeThreshold) {
      return Remarks.Overtime;
    } else {
      return Remarks.OnTimeOut;
    }
  }

  private calculateAttendanceStatus(
    subjectAssignment: any,
    currentTime: string,
    currentDate: Date,
  ): { status: AttendanceOptions; remarks: Remarks } {
    const { startTime, endTime, days } = subjectAssignment;

    // Convert times to minutes for easier comparison
    const currentTimeMinutes = this.timeToMinutes(currentTime);
    const startTimeMinutes = this.timeToMinutes(startTime);
    const endTimeMinutes = this.timeToMinutes(endTime);

    // Check if today is a scheduled day for this assignment
    const currentDay = currentDate.toLocaleString('en-US', { weekday: 'long' });
    const isAssignedDay = days.includes(currentDay);

    if (!isAssignedDay) {
      return {
        status: AttendanceOptions.Absent,
        remarks: Remarks.NotScheduledDay,
      };
    }

    // Define time windows for attendance status calculation
    const fiveMinutesBefore = startTimeMinutes - 5; // 5 minutes grace period before start
    const fiveMinutesAfter = startTimeMinutes + 5; // 5 minutes grace period after start

    // Determine status based on current time relative to schedule
    if (currentTimeMinutes < fiveMinutesBefore) {
      return { status: AttendanceOptions.Absent, remarks: Remarks.TooEarly };
    } else if (
      currentTimeMinutes >= fiveMinutesBefore &&
      currentTimeMinutes <= fiveMinutesAfter
    ) {
      return { status: AttendanceOptions.Present, remarks: Remarks.OnTime };
    } else if (
      currentTimeMinutes > fiveMinutesAfter &&
      currentTimeMinutes <= endTimeMinutes
    ) {
      return { status: AttendanceOptions.Late, remarks: Remarks.LateArrival };
    } else {
      return { status: AttendanceOptions.Absent, remarks: Remarks.ClassEnded };
    }
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  }

  async getAttendanceHistory(userId: number, startDate?: Date, endDate?: Date) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.subjectAssignment', 'subjectAssignment')
      .leftJoinAndSelect('subjectAssignment.subject', 'subject')
      .leftJoinAndSelect('subjectAssignment.room', 'room')
      .leftJoinAndSelect('room.building', 'building')
      .where('attendance.user.id = :userId', { userId });

    // Apply date range filter if provided
    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Order by most recent dates first
    query.orderBy('attendance.date', 'DESC');

    return await query.getMany();
  }
}
