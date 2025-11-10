import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { Subject } from './entities/subject.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { CreateSubjectDTO } from './dto/create-subject.dto';
import { UpdateSubjectDTO } from './dto/update-subject.dto';

@Controller('subjects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getAllSubjects(): Promise<Subject[]> {
    return await this.subjectService.getAllSubjects();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async createSubject(
    @Body() createSubjectDTO: CreateSubjectDTO,
  ): Promise<Subject> {
    return await this.subjectService.createSubject(createSubjectDTO);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getSubjectById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Subject> {
    return await this.subjectService.getSubjectById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDTO: UpdateSubjectDTO,
  ): Promise<Subject> {
    return await this.subjectService.updateSubject(id, updateSubjectDTO);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async deleteSubject(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.subjectService.deleteSubject(id);
  }
}
