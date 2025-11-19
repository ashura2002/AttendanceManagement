import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RoomService } from '../rooms/room.service';
import { SubjectService } from '../subjects/subject.service';
import { convertTo24Hour } from 'src/common/helper/timeConverter';
import { AssignSubjectDTO } from './dto/AssignSubject.dto';
import { SubjectAssignment } from './entities/subject-assignment.entity';
import { UpdateSubjectScheduleDTO } from './dto/UpdateSubjectSchedule.dto';
import { getDayOnDate } from 'src/common/helper/dateConverter';
import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { SubjectAssignmentResponseShape } from './types/getOwnSubjectAssignment.types';

@Injectable()
export class subjectAssignmentService {
  constructor(
    @InjectRepository(SubjectAssignment)
    private readonly subjectAssignmentRepo: Repository<SubjectAssignment>,
    private readonly userService: UsersService,
    private readonly roomService: RoomService,
    private readonly subjectService: SubjectService,
  ) {}

  async assignSubject(
    subjectAssignmentDTO: AssignSubjectDTO,
  ): Promise<SubjectAssignment> {
    const { userId, roomId, subjectId, startTime, endTime, days } =
      subjectAssignmentDTO;

    const user = await this.userService.findById(userId);
    const room = await this.roomService.getRoomById(roomId);
    const subject = await this.subjectService.getSubjectById(subjectId);

    // Convert AM/PM 24-hour time
    const convertedStart = this.convertTo24Hour(startTime);
    const convertedEnd = this.convertTo24Hour(endTime);

    if (convertedStart >= convertedEnd) {
      throw new BadRequestException(
        'Start time must be earlier than end time.',
      );
    }

    // 4. Check if schedule overlaps for same user and same days
    const conflict = await this.subjectAssignmentRepo
      .createQueryBuilder('assign')
      .where('assign.userId = :userId', { userId })
      .andWhere('assign.days && :days', { days }) // array overlap operator
      .andWhere('assign.startTime < :endTime AND assign.endTime > :startTime', {
        startTime: convertedStart,
        endTime: convertedEnd,
      })
      .getOne();

    if (conflict) {
      throw new BadRequestException(
        `Schedule conflict detected: user already has a subject during this time.`,
      );
    }

    const assignment = this.subjectAssignmentRepo.create({
      ...subjectAssignmentDTO,
      subject: subject,
      user: user,
      room: room,
    });
    return await this.subjectAssignmentRepo.save(assignment);
  }

  async updateLoadsSchedule(
    subjectAssignmentID: number,
    updateLoadsDTO: UpdateSubjectScheduleDTO,
  ): Promise<SubjectAssignment> {
    const { startTime, endTime } = updateLoadsDTO;
    const assignment = await this.subjectAssignmentRepo.findOne({
      where: { id: subjectAssignmentID },
    });

    if (!assignment) throw new NotFoundException('Load not found');
    const updatedLoadsSchedule = {
      ...updateLoadsDTO,
      startTime: convertTo24Hour(startTime),
      endTime: convertTo24Hour(endTime),
    };
    Object.assign(assignment, updatedLoadsSchedule);
    return await this.subjectAssignmentRepo.save(assignment);
  }

  async deleteLoads(subjectAssignmentID: number): Promise<void> {
    const assignment = await this.subjectAssignmentRepo.findOne({
      where: { id: subjectAssignmentID },
    });
    if (!assignment) throw new NotFoundException('Loads not found');
    await this.subjectAssignmentRepo.remove(assignment);
  }

  async getOwnSubjectAssignmentByDate(
    userId: number,
    date: Date,
  ): Promise<SubjectAssignmentResponseShape[]> {
    const dayName = getDayOnDate(date);
    await this.userService.findById(userId);

    if (!dayName) return [];

    // e fetch ang subject assignment filter by userId and the date
    const assignments = await this.subjectAssignmentRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect(
        'assignment.attendance',
        'attendance',
        'attendance.date = :date',
        { date },
      )
      .leftJoinAndSelect('assignment.subject', 'subject')
      .leftJoinAndSelect('assignment.room', 'room')
      .leftJoinAndSelect('room.building', 'building')
      .select([
        'assignment.id',
        'assignment.startTime',
        'assignment.endTime',
        'assignment.days',
        'subject.subjectName',
        'subject.controlNumber',
        'subject.subjectDescription',
        'subject.unit',
        'room.roomName',
        'building.buildingName',
        'building.location',
      ])
      .where('assignment.user = :userId', { userId })
      .andWhere(':dayName = ANY(assignment.days)', { dayName })
      .getMany();

    const now = new Date();

    return assignments.map((assign) => {
      // e fetch ang unang attendance if nag exist
      const attendance = assign.attendance?.[0];

      // Build start/end datetime for this assignment
      const [startH, startM, startS] = assign.startTime.split(':').map(Number);
      const [endH, endM, endS] = assign.endTime.split(':').map(Number);

      const startDate = new Date(date);
      startDate.setHours(startH, startM, startS, 0);

      const endDate = new Date(date);
      endDate.setHours(endH, endM, endS, 0);

      const isToday = startDate.toDateString() === now.toDateString();
      const isFutureDay = startDate > now && !isToday; // future day
      const isNotStartedToday = isToday && now < startDate; // later today
      const isEnded = now > endDate; // class ended

      // the assign is the subject assignment

      // CASE 1: FUTURE DAY → upcoming
      if (!attendance && isFutureDay) {
        return {
          ...assign,
          attendance: {
            timeIn: null,
            timeOut: null,
            totalHours: 0,
            status: Remarks.NoClockInRecord,
            remarks: Remarks.UpComming,
          },
        };
      }

      // CASE 2: TODAY but class not started → not started
      if (!attendance && isNotStartedToday) {
        return {
          ...assign,
          attendance: {
            timeIn: null,
            timeOut: null,
            totalHours: 0,
            status: Remarks.NoClockInRecord,
            remarks: Remarks.NotStarted,
          },
        };
      }

      // CASE 3: No attendance + class ended → absent
      if (!attendance && isEnded) {
        return {
          ...assign,
          attendance: {
            timeIn: null,
            timeOut: null,
            totalHours: 0,
            status: Remarks.NoClockInRecord,
            remarks: Remarks.Absent,
          },
        };
      }

      // CASE 4: Attendance exists → return actual data
      return {
        ...assign,
        attendance: {
          timeIn: attendance.timeIn,
          timeOut: attendance.timeOut,
          totalHours: attendance.totalHours,
          status: attendance.status,
          remarks: attendance.remarks,
        },
      };
    });
  }

  async getUsersLoad(userId: number): Promise<SubjectAssignment[]> {
    await this.userService.findById(userId);

    const assignment = await this.subjectAssignmentRepo
      .createQueryBuilder('assign')
      .leftJoin('assign.subject', 'subject')
      .select([
        'assign.id',
        'assign.startTime',
        'assign.endTime',
        'subject.subjectName',
      ])
      .where('assign.user =:userId', { userId })
      .getMany();
    return assignment;
  }

  private convertTo24Hour(time: string): string {
    // Normalize input: ensure space before AM/PM
    const match = time.match(/(\d{1,2}:\d{2})\s?(AM|PM)/i);
    if (!match) {
      throw new BadRequestException(
        `Invalid time format. Expected hh:mm AM/PM, got: ${time}`,
      );
    }

    const timePart = match[1]; // "08:30"
    const modifier = match[2].toUpperCase(); // "AM" or "PM"

    let [hours, minutes] = timePart.split(':');
    let hourNum = parseInt(hours, 10);

    if (modifier === 'PM' && hourNum !== 12) hourNum += 12;
    if (modifier === 'AM' && hourNum === 12) hourNum = 0;

    return `${hourNum.toString().padStart(2, '0')}:${minutes}:00`;
  }
}
