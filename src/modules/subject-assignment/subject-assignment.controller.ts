import {
  Body,
  Controller,
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
import { subjectAssignmentService } from './subject-assignment.service';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { SubjectAssignment } from './entities/subject-assignment.entity';
import { AssignSubjectDTO } from './dto/AssignSubject.dto';
import { UpdateSubjectScheduleDTO } from './dto/UpdateSubjectSchedule.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('subject-assignment')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
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

  @Get('employee')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Employee)
  async getOwnSubjectAssignmentByDate(
    @Req() req,
    @Query('date') date: Date,
  ): Promise<any> {
    const { userId } = req.user;
    return await this.subjectAssignmentService.getOwnSubjectAssignmentByDate(
      userId,
      date,
    );
  }
}
