import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { subjectAssignmentService } from '../subjectAssignment/subjectAssignment.service';
import { Remarks } from 'src/common/enums/remarkOptions.enum';

@Injectable()
export class AttendancesService {
    constructor(@InjectRepository(Attendance) private readonly attendanceRepository: Repository<Attendance>, private readonly userService: UsersService, private readonly subjectAssignmentService: subjectAssignmentService) { }

async timeIn(userId: number): Promise<Attendance> {
  const dateNow = new Date();
  const employee = await this.userService.findById(userId);

    // check if already time in
    const alreadyTimeIn = await this.attendanceRepository.findOne({
        where:{user:{id:userId}}
    })
    if(alreadyTimeIn) throw new BadRequestException('Already time in')


  // Get all subject assignments for today
  const todaySchedule = await this.subjectAssignmentService.getLoadsByDate(userId, dateNow);

  if (!todaySchedule.length) 
    throw new BadRequestException(`You can't mark attendance since you don't have subjects today.`);

  const currentTime = dateNow.getTime();

  const activeAssignments = todaySchedule.filter((sched) => {
    // Create Date objects for start/end
    const start = new Date(dateNow);
    const end = new Date(dateNow);

    const [startHours, startMinutes] = sched.startTime.split(':').map(Number);
    const [endHours, endMinutes] = sched.endTime.split(':').map(Number);

    start.setHours(startHours, startMinutes, 0, 0);
    end.setHours(endHours, endMinutes, 0, 0);

    // Calculate 5 minutes before and after startTime
    const fiveMinBefore = new Date(start.getTime() - 5 * 60 * 1000).getTime();
    const fiveMinAfter = new Date(start.getTime() + 5 * 60 * 1000).getTime();

    return (currentTime >= fiveMinBefore && currentTime <= fiveMinAfter) || 
           (currentTime >= start.getTime() && currentTime <= end.getTime());
  });

  if (!activeAssignments.length) {
    throw new BadRequestException(`You don't have any subject active at this time.`);
  }

  // Pick the first valid assignment
  const assignment = activeAssignments[0];

  // Determine remarks
  const [startHours, startMinutes] = assignment.startTime.split(':').map(Number);
  const startTimeDate = new Date(dateNow);
  startTimeDate.setHours(startHours, startMinutes, 0, 0);

  const diffMinutes = (currentTime - startTimeDate.getTime()) / 1000 / 60;
  let remarks: Remarks;

  if (diffMinutes >= -5 && diffMinutes <= 5) {
    remarks = Remarks.Present; // Within 5 minutes before/after start
  } else if (diffMinutes > 5) {
    remarks = Remarks.Late; // More than 5 minutes late
  } else {
    remarks = Remarks.Early; // Arrived too early (more than 5 min before)
  }

  const attendance = this.attendanceRepository.create({
    user: employee,
    assignment: assignment,
    date: dateNow.toISOString().split('T')[0], // YYYY-MM-DD for date column
    timeIn: dateNow.toTimeString().split(' ')[0], // HH:mm:ss for time column
    remarks: remarks,
  });

  return await this.attendanceRepository.save(attendance);
}
}
// TODO -> 
// add time out 
// add on leave if user is on leave with in that day
// add leave credits for every employee