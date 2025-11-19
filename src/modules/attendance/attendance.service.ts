import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

//   async timeIn(userId: number): Promise<Attendance> {
//     const dateNow = new Date();
//     const employee = await this.userService.findById(userId);

//     // Get all subject assignments for today
//     const todaySchedule = await this.subjectAssignmentService.getLoadsByDate(
//       userId,
//       dateNow,
//     );

//     if (!todaySchedule.length)
//       throw new BadRequestException(
//         `You can't mark attendance since you don't have subjects today.`,
//       );

//     const currentTime = dateNow.getTime();

//     const activeAssignments = todaySchedule.filter((sched) => {
//       const start = new Date(dateNow);
//       const end = new Date(dateNow);

//       const [startHours, startMinutes] = sched.startTime.split(':').map(Number);
//       const [endHours, endMinutes] = sched.endTime.split(':').map(Number);

//       start.setHours(startHours, startMinutes, 0, 0);
//       end.setHours(endHours, endMinutes, 0, 0);

//       const fiveMinBefore = start.getTime() - 5 * 60 * 1000;
//       const fiveMinAfter = start.getTime() + 5 * 60 * 1000;

//       return (
//         (currentTime >= fiveMinBefore && currentTime <= fiveMinAfter) ||
//         (currentTime >= start.getTime() && currentTime <= end.getTime())
//       );
//     });

//     if (!activeAssignments.length) {
//       throw new BadRequestException(
//         `You don't have any subject active at this time.`,
//       );
//     }

//     // Select the correct subject assignment
//     const assignment = activeAssignments[0];

//     // check if already timed in FOR THIS SUBJECT ONLY
//     const alreadyTimeIn = await this.attendanceRepository.findOne({
//       where: {
//         user: { id: userId },
//         assignment: { id: assignment.id },
//         date: dateNow.toISOString().split('T')[0],
//       },
//     });

//     if (alreadyTimeIn) {
//       throw new BadRequestException('You already timed in for this subject.');
//     }

//     // paras remarks
//     const [startHours, startMinutes] = assignment.startTime
//       .split(':')
//       .map(Number);
//     const startTimeDate = new Date(dateNow);
//     startTimeDate.setHours(startHours, startMinutes, 0, 0);

//     const diffMinutes = (currentTime - startTimeDate.getTime()) / 1000 / 60;

//     let attendanceStatus: Remarks;
//     if (diffMinutes >= -5 && diffMinutes <= 5)
//       attendanceStatus = Remarks.Present;
//     else if (diffMinutes > 5) attendanceStatus = Remarks.Late;
//     else attendanceStatus = Remarks.Early;

//     const attendance = this.attendanceRepository.create({
//       user: employee,
//       assignment: assignment,
//       date: dateNow.toISOString().split('T')[0],
//       timeIn: dateNow.toTimeString().split(' ')[0],
//       attendanceStatus,
//     });

//     return await this.attendanceRepository.save(attendance);
//   }
}
