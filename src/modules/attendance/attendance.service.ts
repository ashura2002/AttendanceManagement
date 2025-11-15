import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AssignmentService } from '../assignments/assignment.service';
import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { LeaveRequestService } from '../leave-request/leave-request.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: AssignmentService,
    private readonly leaveService: LeaveRequestService,
  ) {}
  async timeIn(userId: number): Promise<any> {
    const employee = await this.userService.findById(userId);
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Get assignments for today
    const assignments =
      await this.subjectAssignmentService.getAllOwnSubjectAssignments(
        userId,
        dateString,
      );

    if (!assignments.length)
      throw new BadRequestException('You have no subjects on this day');

    // Check if already timed in
    const existing = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: dateString },
    });

    if (existing) throw new BadRequestException('You already timed in today');

    const now = new Date();
    now.setSeconds(0, 0);

    // Convert schedule times
    const schedules = assignments.map((a) => ({
      ...a,
      startTimeObj: this.convertTime(a.startTime),
      endTimeObj: this.convertTime(a.endTime),
    }));

    // Pick closest schedule ongoing -> upcoming -> last
    let closestSchedule =
      schedules.find((s) => now >= s.startTimeObj && now <= s.endTimeObj) ||
      schedules.find((s) => now < s.startTimeObj) ||
      schedules[schedules.length - 1];

    // 5 min early, 10 min late
    const earlyAllowed = new Date(
      closestSchedule.startTimeObj.getTime() - 5 * 60 * 1000,
    );
    const lateAllowed = new Date(
      closestSchedule.startTimeObj.getTime() + 10 * 60 * 1000,
    );

    if (now < earlyAllowed)
      throw new BadRequestException('Too early, cannot time in yet');
    if (now > lateAllowed)
      throw new BadRequestException('Too late, you are marked absent');

    // Determine remark  exact start time is Present
    const startMinutes =
      closestSchedule.startTimeObj.getHours() * 60 +
      closestSchedule.startTimeObj.getMinutes();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const remark: Remarks =
      nowMinutes <= startMinutes ? Remarks.Present : Remarks.Late;

    const newAttendance = this.attendanceRepo.create({
      user: employee,
      assignment: closestSchedule,
      date: dateString,
      timeIn: now,
      status: remark,
    });

    await this.attendanceRepo.save(newAttendance);

    return {
      message: 'Time in recorded successfully',
      remark,
      schedule: {
        id: closestSchedule.id,
        startTime: closestSchedule.startTime,
        endTime: closestSchedule.endTime,
        subject: closestSchedule.subjects[0]?.subjectName,
        room: closestSchedule.room?.roomName,
      },
    };
  }

  async timeOut(userId: number): Promise<any> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const attendance = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: dateString },
      relations: ['assignment'],
    });

    if (!attendance)
      throw new BadRequestException('You have not timed in today');
    if (attendance.timeOut)
      throw new BadRequestException('You already timed out today');

    const now = new Date();
    now.setSeconds(0, 0);
    attendance.timeOut = now;

    // Check if leaving early
    const endTime = this.convertTime(attendance.assignment.endTime);
    if (now < endTime && attendance.status === Remarks.Present) {
      attendance.status = Remarks.LeftEarly;
    }

    // for overtime
    if (now > endTime && attendance.status === Remarks.Present) {
      attendance.status = Remarks.Overtime;
    }

    // Calculate total hours
    const diffMs = attendance.timeOut.getTime() - attendance.timeIn.getTime();
    const diffHours = diffMs / 1000 / 60 / 60; // hours
    attendance.totalHours = Number(diffHours.toFixed(2));

    await this.attendanceRepo.save(attendance);

    return {
      message: 'Time out recorded successfully',
      timeOut: attendance.timeOut,
      totalHours: attendance.totalHours,
    };
  }

  async getOwnAttendance(userId: number): Promise<any> {
    const attendance = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .select([
        'attendance.id',
        'attendance.date',
        'attendance.timeIn',
        'attendance.timeOut',
        'attendance.status',
        'attendance.totalHours',
        'user.id',
        'user.displayName',
        'user.email',
      ])
      .where('attendance.user =:userId', { userId })
      .getMany();
    return attendance;
  }

  // helper fnction convert hours   to date object
  private convertTime(time: string): Date {
    const [hourMinute, meridian] = time.toLowerCase().split(/(am|pm)/);
    let [hour, minute] = hourMinute.split(':').map(Number);

    if (meridian === 'pm' && hour !== 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }
}
