import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
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
import { UpdateAssignmentDTO } from './dto/update-assignment.dto';

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

  @Get('own')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Employee)
  async getAllOwnSubjectAssignments(
    @Req() req,
    @Query('date') date: string,
  ): Promise<AssignmentSubject[]> {
    const { userId } = req.user;
    return await this.assignSubjectService.getAllOwnSubjectAssignments(
      userId,
      date,
    );
  }

  @Get('admin/:userId/loads')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getEmployeesAssignments(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AssignmentSubject[]> {
    return await this.assignSubjectService.getEmployeesAssignment(userId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDTO: UpdateAssignmentDTO,
  ): Promise<AssignmentSubject> {
    return await this.assignSubjectService.updateAssignment(
      id,
      updateAssignmentDTO,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async deleteAssignment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.assignSubjectService.deleteAssignment(id);
  }
}
