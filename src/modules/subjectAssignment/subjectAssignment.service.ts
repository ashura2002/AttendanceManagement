import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectAssignment } from './entities/subjectAssignment.entity';
import { Repository } from 'typeorm';
import { AssignSubjectDTO } from './dto/assignSubject.dto';
import { UsersService } from '../users/users.service';
import { RoomService } from '../rooms/room.service';
import { SubjectService } from '../subjects/subject.service';
import { UpdateSubjectScheduleDTO } from './dto/updateSubjectSchedule.dto';
import { convertTo24Hour } from 'src/common/helper/timeConverter';
import { getDayOnDate } from 'src/common/helper/dateConverter';
import { LeaveRequestService } from '../leave-request/leave-request.service';

@Injectable()
export class subjectAssignmentService {
  constructor(
    @InjectRepository(SubjectAssignment)
    private readonly subjectAssignmentRepo: Repository<SubjectAssignment>,
    private readonly userService: UsersService,
    private readonly roomService: RoomService,
    private readonly subjectService: SubjectService,
    private readonly leaveService: LeaveRequestService,
  ) { }

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
      throw new BadRequestException('Start time must be earlier than end time.');
    }

    // 4. Check if schedule overlaps for same user and same days
    const conflict = await this.subjectAssignmentRepo
      .createQueryBuilder('assign')
      .where('assign.user = :userId', { userId })
      .andWhere('assign.days && :days', { days }) // array overlap operator
      .andWhere(
        'assign.startTime < :endTime AND assign.endTime > :startTime',
        {
          startTime: convertedStart,
          endTime: convertedEnd,
        },
      )
      .getOne();

    if (conflict) {
      throw new BadRequestException(
        `Schedule conflict detected: user already has a subject during this time.`,
      );
    }

    const newAssignment = this.subjectAssignmentRepo.create({
      startTime: convertedStart,
      endTime: convertedEnd,
      days,
      user,
      room,
      subjects: subject,
    });

    return await this.subjectAssignmentRepo.save(newAssignment);
  }

  async getOwnSubjectAssignments(userId: number): Promise<SubjectAssignment[]> {
    await this.userService.findById(userId);
    const subjectLoads = await this.subjectAssignmentRepo
      .createQueryBuilder('loads')
      .leftJoin('loads.subjects', 'subjects')
      .leftJoin('loads.room', 'room')
      .leftJoin('room.building', 'building')
      .leftJoin('loads.user', 'user')
      .select([
        'loads.id',
        'loads.remarks',
        'loads.startTime',
        'loads.endTime',
        'loads.days',
        'loads.timeIn',
        'loads.timeOut',
        'subjects.subjectName',
        'subjects.controlNumber',
        'subjects.subjectDescription',
        'subjects.unit',
        'room.roomName',
        'building.buildingName',
        'building.location',
      ])
      .where('loads.user =:userId', { userId })
      .getMany();
    return subjectLoads;
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

  async getLoadsByDate(
    userId: number,
    date: Date,
  ): Promise<SubjectAssignment[]> {
    const convertedDate = new Date(date);
    const dayName = getDayOnDate(convertedDate);

    if (!dayName) return [];

    const assignment = this.subjectAssignmentRepo
      .createQueryBuilder('loads')
      .leftJoinAndSelect('loads.subjects', 'subjects')
      .leftJoinAndSelect('loads.room', 'room')
      .where('loads.user =:userId', { userId })
      .andWhere(':dayName = ANY(loads.days)', { dayName });

    return await assignment.getMany();
  }

  async getAllUserLoadsByAdmin(userId: number): Promise<SubjectAssignment[]> {
    const assignment = await this.subjectAssignmentRepo
      .createQueryBuilder('loads')
      .leftJoin('loads.user', 'user')
      .leftJoin('loads.subjects', 'subjects')
      .leftJoin('loads.room', 'room')
      .leftJoin('room.building', 'building')
      .select([
        'loads.id',
        'loads.remarks',
        'loads.startTime',
        'loads.endTime',
        'loads.days',
        'subjects.subjectName',
        'subjects.controlNumber',
        'subjects.subjectDescription',
        'subjects.unit',
        'room.roomName',
        'building.buildingName',
        'building.location',
      ])
      .where('loads.user =:userId', { userId })
      .getMany();
    return assignment;
  }

  async findSubjectAssignmentById(userId: number) {
    const assignment = await this.subjectAssignmentRepo
      .createQueryBuilder('assignment')
      .where('assignment.user =:userId', { userId })
      .getOne();
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
