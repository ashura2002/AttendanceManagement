import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subjectAssignment/subjectAssignment.service';
import { Remarks } from 'src/common/enums/remarkOptions.enum';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly userService: UsersService,
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) {}

  async timeIn(userId: number): Promise<Attendance> {
    const dateNow = new Date();
    const employee = await this.userService.findById(userId);

    // Get all subject assignments for today
    const todaySchedule = await this.subjectAssignmentService.getLoadsByDate(
      userId,
      dateNow,
    );

    if (!todaySchedule.length)
      throw new BadRequestException(
        `You can't mark attendance since you don't have subjects today.`,
      );

    const currentTime = dateNow.getTime();

    const activeAssignments = todaySchedule.filter((sched) => {
      const start = new Date(dateNow);
      const end = new Date(dateNow);

      const [startHours, startMinutes] = sched.startTime.split(':').map(Number);
      const [endHours, endMinutes] = sched.endTime.split(':').map(Number);

      start.setHours(startHours, startMinutes, 0, 0);
      end.setHours(endHours, endMinutes, 0, 0);

      const fiveMinBefore = start.getTime() - 5 * 60 * 1000;
      const fiveMinAfter = start.getTime() + 5 * 60 * 1000;

      return (
        (currentTime >= fiveMinBefore && currentTime <= fiveMinAfter) ||
        (currentTime >= start.getTime() && currentTime <= end.getTime())
      );
    });

    if (!activeAssignments.length) {
      throw new BadRequestException(
        `You don't have any subject active at this time.`,
      );
    }

    // Select the correct subject assignment
    const assignment = activeAssignments[0];

    // check if already timed in FOR THIS SUBJECT ONLY
    const alreadyTimeIn = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        assignment: { id: assignment.id },
        date: dateNow.toISOString().split('T')[0],
      },
    });

    if (alreadyTimeIn) {
      throw new BadRequestException('You already timed in for this subject.');
    }

    // paras remarks
    const [startHours, startMinutes] = assignment.startTime
      .split(':')
      .map(Number);
    const startTimeDate = new Date(dateNow);
    startTimeDate.setHours(startHours, startMinutes, 0, 0);

    const diffMinutes = (currentTime - startTimeDate.getTime()) / 1000 / 60;

    let attendanceStatus: Remarks;
    if (diffMinutes >= -5 && diffMinutes <= 5)
      attendanceStatus = Remarks.Present;
    else if (diffMinutes > 5) attendanceStatus = Remarks.Late;
    else attendanceStatus = Remarks.Early;

    const attendance = this.attendanceRepository.create({
      user: employee,
      assignment: assignment,
      date: dateNow.toISOString().split('T')[0],
      timeIn: dateNow.toTimeString().split(' ')[0],
      attendanceStatus,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async timeOut(userId: number): Promise<Attendance> {
    const dateNow = new Date();
    await this.userService.findById(userId);

    const today = dateNow.toISOString().split('T')[0];

    // get all today's attendance records for this user
    const todaysAttendance = await this.attendanceRepository.find({
      where: { user: { id: userId }, date: today },
      relations: ['assignment'],
    });

    if (!todaysAttendance.length) {
      throw new BadRequestException(
        `You can't time out since you haven't timed in yet.`,
      );
    }

    // identify which attendance matches the current time
    const currentTime = dateNow.getTime();
    let activeAttendance: Attendance | null = null;

    for (const record of todaysAttendance) {
      const assignment = record.assignment;

      const start = new Date(dateNow);
      const end = new Date(dateNow);

      const [startH, startM] = assignment.startTime.split(':').map(Number);
      const [endH, endM] = assignment.endTime.split(':').map(Number);

      start.setHours(startH, startM, 0, 0);
      end.setHours(endH, endM, 0, 0);

      if (currentTime >= start.getTime() && currentTime <= end.getTime()) {
        activeAttendance = record;
        break;
      }
    }

    if (!activeAttendance) {
      throw new BadRequestException(
        `No active subject found right now. You cannot time out.`,
      );
    }

    // Prevent double timeout
    if (activeAttendance.timeOut) {
      throw new BadRequestException(`You already timed out for this subject.`);
    }

    const assignment = activeAttendance.assignment;

    // Build end time date
    const [endHours, endMinutes] = assignment.endTime.split(':').map(Number);
    const endTimeDate = new Date(dateNow);
    endTimeDate.setHours(endHours, endMinutes, 0, 0);

    let finalRemarks = activeAttendance.remarks;

    // EARLY OUT
    if (currentTime < endTimeDate.getTime()) {
      finalRemarks = Remarks.LeftEarly;
    }

    // OVERTIME
    if (currentTime > endTimeDate.getTime()) {
      finalRemarks = Remarks.Overtime;
    }

    // Compute total hours
    const timeInDate = new Date(
      `${activeAttendance.date}T${activeAttendance.timeIn}`,
    );
    const timeOutDate = dateNow;

    const diffMs = timeOutDate.getTime() - timeInDate.getTime();
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    // Save
    activeAttendance.timeOut = dateNow.toTimeString().split(' ')[0];
    activeAttendance.totalHours = diffHours;
    activeAttendance.remarks = finalRemarks;

    return await this.attendanceRepository.save(activeAttendance);
  }

  async getAllOwnAttendanceByDate(
    userId: number,
    date: Date,
  ): Promise<Attendance[]> {
    const formattedDate = new Date(date);
    await this.userService.findById(userId);

    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.assignment', 'assignment')
      .leftJoin('assignment.subjects', 'subjects')
      .leftJoin('assignment.room', 'room')
      .leftJoin('room.building', 'building')
      .select([
        'attendance.id',
        'attendance.timeIn',
        'attendance.timeOut',
        'attendance.timeOut',
        'attendance.totalHours',
        'attendance.date',
        'attendance.remarks',
        'attendance.attendanceStatus',
        'assignment.startTime',
        'assignment.endTime',
        'assignment.days',
        'subjects.subjectName',
        'subjects.controlNumber',
        'subjects.subjectDescription',
        'subjects.unit',
        'room.roomName',
        'building.buildingName',
      ])
      .where('attendance.user =:userId', { userId })
      .andWhere('attendance.date =:date', { date: formattedDate })
      .getMany();

    return attendance;
  }

  async getEmployeesAttendanceByDate(
    userId: number,
    date: Date,
  ): Promise<Attendance[]> {
    await this.userService.findById(userId);
    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.assignment', 'assignment')
      .leftJoin('assignment.subjects', 'subjects')
      .leftJoin('assignment.room', 'room')
      .leftJoin('room.building', 'building')
      .select([
        'attendance.id',
        'attendance.timeIn',
        'attendance.timeOut',
        'attendance.timeOut',
        'attendance.totalHours',
        'attendance.date',
        'attendance.remarks',
        'attendance.attendanceStatus',
        'assignment.startTime',
        'assignment.endTime',
        'assignment.days',
        'subjects.subjectName',
        'subjects.controlNumber',
        'subjects.subjectDescription',
        'subjects.unit',
        'room.roomName',
        'building.buildingName',
      ])
      .where('attendance.user =:userId', { userId })
      .andWhere('attendance.date =:date', { date: new Date(date) })
      .getMany();
    return attendance;
  }
}
