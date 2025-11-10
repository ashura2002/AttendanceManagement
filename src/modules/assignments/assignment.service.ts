import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentSubject } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { CreateSubjectAssignmentDTO } from './dto/create-assignment.dto';
import { UsersService } from '../users/users.service';
import { SubjectService } from '../subjects/subject.service';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(AssignmentSubject)
    private readonly assignSubjectRepo: Repository<AssignmentSubject>,
    private readonly userService: UsersService,
    private readonly subjectService: SubjectService,
  ) {}

  async createAssignment(
    createAssignmentDTO: CreateSubjectAssignmentDTO,
  ): Promise<AssignmentSubject> {
    const { user, subjects } = createAssignmentDTO;

    const employee = await this.userService.findById(user);
    const subjectToAssign = await this.subjectService.getSubjectById(subjects);
    const existedSubject = await this.assignSubjectRepo.findOne({
      where: { subject: { id: subjectToAssign.id } },
      relations: ['subject'],
    });
    if (existedSubject)
      throw new BadRequestException(
        `${existedSubject.subject.subjectName} is already been added.`,
      );
    const subjectAssignment = this.assignSubjectRepo.create({
      ...createAssignmentDTO,
      user: employee,
      subject: subjectToAssign,
    });
    return await this.assignSubjectRepo.save(subjectAssignment);
  }

  async getEmployeesAssignment(userId: number): Promise<AssignmentSubject[]> {
    const user = await this.userService.findById(userId);
    const employeesLoad = await this.assignSubjectRepo.find({
      where: { user: { id: user.id } },
      relations: ['subject'],
    });
    return employeesLoad;
  }
}
