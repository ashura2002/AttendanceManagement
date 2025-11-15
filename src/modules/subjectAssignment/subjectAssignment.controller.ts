import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Employee)
  async getOwnSubjectAssignments(@Req() req): Promise<any> {
    const { userId } = req.user;
    return await this.subjectAssignmentService.getOwnSubjectAssignments(userId);
  }

  // get by date
}
