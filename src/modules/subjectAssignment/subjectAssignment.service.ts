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
import { Remarks } from 'src/common/enums/remarkOptions.enum';

@Injectable()
export class subjectAssignmentService {
  constructor(
    @InjectRepository(SubjectAssignment)
    private readonly subjectAssignmentRepo: Repository<SubjectAssignment>,
    private readonly userService: UsersService,
    private readonly roomService: RoomService,
    private readonly subjectService: SubjectService,
    private readonly leaveService: LeaveRequestService,
  ) {}

  async assignSubject(
    subjectAssignmentDTO: AssignSubjectDTO,
  ): Promise<SubjectAssignment> {
    const { userId, roomId, subjectId, startTime, endTime } =
      subjectAssignmentDTO;
    const user = await this.userService.findById(userId);
    const rooms = await this.roomService.getRoomById(roomId);
    const subjects = await this.subjectService.getSubjectById(subjectId);

    if (startTime > endTime)
      throw new BadRequestException('Start time must be lower than endtime');

    const subjectsAssign = this.subjectAssignmentRepo.create({
      ...subjectAssignmentDTO,
      user: user,
      room: rooms,
      subjects: subjects,
    });
    return await this.subjectAssignmentRepo.save(subjectsAssign);
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
    const now = new Date();
    // add on leave on subject remark if user is on leave
    const onLeaveUser = await this.leaveService.findOnLeaveEmployee(userId);
    const validRequest = onLeaveUser.find((r) => new Date(r.endDate) > now);
    if (validRequest) {
      console.log('still on leave');
      // update remark if the user is currently on leave
      await this.subjectAssignmentRepo.update(
        { user: { id: userId } },
        { remarks: Remarks.OnLeave },
      );
    } else {
      await this.subjectAssignmentRepo.update(
        { user: { id: userId } },
        { remarks: Remarks.NoClockInRecord },
      );
    }

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
}
