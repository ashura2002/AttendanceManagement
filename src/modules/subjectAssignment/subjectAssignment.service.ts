import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectAssignment } from './entities/subjectAssignment.entity';
import { Repository } from 'typeorm';
import { AssignSubjectDTO } from './dto/assignSubject.dto';
import { UsersService } from '../users/users.service';
import { RoomService } from '../rooms/room.service';
import { SubjectService } from '../subjects/subject.service';

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

  async getOwnSubjectAssignments(userId: number): Promise<any> {
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
}
