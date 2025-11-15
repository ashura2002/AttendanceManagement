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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { subjectAssignmentService } from './subjectAssignment.service';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { AssignSubjectDTO } from './dto/assignSubject.dto';
import { SubjectAssignment } from './entities/subjectAssignment.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateSubjectScheduleDTO } from './dto/updateSubjectSchedule.dto';

@Controller('subject-assignment')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@SkipThrottle()
export class SubjectAssignmentController {
  constructor(
    private readonly subjectAssignmentService: subjectAssignmentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async assignSubjects(
    @Body() subjectAssignmentDTO: AssignSubjectDTO,
  ): Promise<SubjectAssignment> {
    return await this.subjectAssignmentService.assignSubject(
      subjectAssignmentDTO,
    );
  }

  @Get('all-own')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Employee)
  async getOwnSubjectAssignments(@Req() req): Promise<SubjectAssignment[]> {
    const { userId } = req.user;
    return await this.subjectAssignmentService.getOwnSubjectAssignments(userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async updateLoadsSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoadsDTO: UpdateSubjectScheduleDTO,
  ): Promise<SubjectAssignment> {
    return await this.subjectAssignmentService.updateLoadsSchedule(
      id,
      updateLoadsDTO,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @HttpCode(HttpStatus.OK)
  async deleteLoads(@Param('id') id: number): Promise<void> {
    return await this.subjectAssignmentService.deleteLoads(id);
  }

  @Get('by-date')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Employee)
  async getLoadsByDate(
    @Req() req,
    @Query('date') date: Date,
  ): Promise<SubjectAssignment[]> {
    const { userId } = req.user;
    return await this.subjectAssignmentService.getLoadsByDate(userId, date);
  }

  @Get('users-load/:id')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.OK)
  async getAllUserLoadsByAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubjectAssignment[]> {
    return await this.subjectAssignmentService.getAllUserLoadsByAdmin(id);
  }
}
