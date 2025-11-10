import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateSubjectDTO } from './dto/create-subject.dto';
import { UpdateSubjectDTO } from './dto/update-subject.dto';

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

  async updateSubject(
    subjectId: number,
    updateSubjectDTO: UpdateSubjectDTO,
  ): Promise<Subject> {
    const subject = await this.subjectRepo.findOne({
      where: { id: subjectId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    if (updateSubjectDTO.subjectName === subject.subjectName)
      throw new BadRequestException(
        `${updateSubjectDTO.subjectName} is already exists. Try another subject name`,
      );

    Object.assign(subject, updateSubjectDTO);
    return await this.subjectRepo.save(subject);
  }

  async deleteSubject(subjectId: number): Promise<void> {
    const subject = await this.subjectRepo.findOne({
      where: { id: subjectId },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    await this.subjectRepo.remove(subject);
  }
}
