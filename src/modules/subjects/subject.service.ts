import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateSubjectDTO } from './dto/create-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  async getAllSubjects(): Promise<Subject[]> {
    const subject = await this.subjectRepo.find();
    return subject;
  }

  async createSubject(createSubjectDTO: CreateSubjectDTO): Promise<Subject> {
    const subjectExisted = await this.subjectRepo.findOne({
      where: { subjectName: createSubjectDTO.subjectName },
    });
    if (subjectExisted)
      throw new BadRequestException(
        `${createSubjectDTO.subjectName} is already exist`,
      );
    const subject = this.subjectRepo.create(createSubjectDTO);
    return await this.subjectRepo.save(subject);
  }

  async getSubjectById(subjectId: number): Promise<Subject> {
    const subject = await this.subjectRepo.findOne({
      where: { id: subjectId },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }
}
