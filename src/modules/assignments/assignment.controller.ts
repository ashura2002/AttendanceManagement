import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AssignmentService } from './assignment.service';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { CreateSubjectAssignmentDTO } from './dto/create-assignment.dto';
import { AssignmentSubject } from './entities/assignment.entity';

@Controller('subject-assignment')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('access-token')
export class AssignmentController {
  constructor(private readonly assignSubjectService: AssignmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async createSubjectAssignment(
    @Body() createAssignmentDTO: CreateSubjectAssignmentDTO,
  ): Promise<AssignmentSubject> {
    return this.assignSubjectService.createAssignment(createAssignmentDTO);
  }

  @Get(':userId/loads')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getEmployeesAssignments(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AssignmentSubject[]> {
    return await this.assignSubjectService.getEmployeesAssignment(userId);
  }
}
