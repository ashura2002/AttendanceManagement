import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentSubject } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { CreateSubjectAssignmentDTO } from './dto/create-assignment.dto';
import { UsersService } from '../users/users.service';
import { SubjectService } from '../subjects/subject.service';
import { UpdateAssignmentDTO } from './dto/update-assignment.dto';
import { ScheduleSubject } from 'src/common/enums/scheduleSubject.enum';
import { RoomService } from '../rooms/room.service';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(AssignmentSubject)
    private readonly assignSubjectRepo: Repository<AssignmentSubject>,
    private readonly userService: UsersService,
    private readonly subjectService: SubjectService,
    private readonly roomService: RoomService,
  ) {}

  async createAssignment(
    createAssignmentDTO: CreateSubjectAssignmentDTO,
  ): Promise<AssignmentSubject> {
    const { user, subjects, room } = createAssignmentDTO;
    const employee = await this.userService.findById(user);
    const existedRoom = await this.roomService.getRoomById(room);
    const subjectToAssign = await this.subjectService.getSubjectById(subjects);

    const assignment = this.assignSubjectRepo.create({
      ...createAssignmentDTO,
      user: employee,
      room: existedRoom,
      subjects: [subjectToAssign], // array of sub
    });
    return await this.assignSubjectRepo.save(assignment);
  }

  async getEmployeesAssignment(userId: number): Promise<AssignmentSubject[]> {
    const user = await this.userService.findById(userId);
    const assignment = await this.assignSubjectRepo.find({
      where: { user: { id: user.id } },
      relations: ['subjects'],
    });
    return assignment;
  }

  async getAllOwnSubjectAssignments(
    userId: number,
    date: string,
  ): Promise<AssignmentSubject[]> {
    const query = this.assignSubjectRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.subjects', 'subjects')
      .leftJoinAndSelect('assignment.room', 'room')
      .leftJoinAndSelect('room.building', 'building')
      .where('assignment.user =:userId', { userId });

    if (date) {
      const dayName = this.getdayNameByDate(date);
      // pang debug
      if (!dayName) console.warn(`Invalid date provided: ${date}`);
      if (dayName) {
        query.andWhere(':dayName = ANY(assignment.daySchedule)', { dayName });
      }
    }
    return await query.getMany();
  }

  async updateAssignment(
    assignmentID: number,
    updateAssignmentDTO: UpdateAssignmentDTO,
  ): Promise<AssignmentSubject> {
    const assignment = await this.assignSubjectRepo.findOne({
      where: { id: assignmentID },
    });
    if (!assignment) throw new NotFoundException('Assignment does not exist');
    Object.assign(assignment, updateAssignmentDTO);
    return await this.assignSubjectRepo.save(assignment);
  }

  async deleteAssignment(assignmentID: number): Promise<void> {
    const assignment = await this.assignSubjectRepo.findOne({
      where: { id: assignmentID },
    });
    if (!assignment)
      throw new NotFoundException('Subject assignment not found');
    await this.assignSubjectRepo.remove(assignment);
  }

  private getdayNameByDate(dateString: string): ScheduleSubject | null {
    const date = new Date(dateString);
    const day = date.getDay();

    const daysAndDate: Record<number, ScheduleSubject> = {
      0: ScheduleSubject.Sun,
      1: ScheduleSubject.Mon,
      2: ScheduleSubject.Tue,
      3: ScheduleSubject.Wed,
      4: ScheduleSubject.Thurs,
      5: ScheduleSubject.Fri,
      6: ScheduleSubject.Sat,
    };

    return daysAndDate[day] || null;
  }
}
