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
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateDepartmentDTO } from './dto/create-department.dto';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { UpdateDepartmentDTO } from './dto/update-department.dto';
import { DepartmentWithEmployees } from './types/DepartmentWithEmployees.types';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('departments')
@UseGuards(JwtAuthGuard, RoleGuard)
export class DepartmentsController {
  constructor(private readonly departmentService: DepartmentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr)
  async getAllDepartments(): Promise<Department[]> {
    return this.departmentService.getAllDepartments();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @customRoleDecorator(Roles.Admin, Roles.Hr)
  async createDep(
    @Body() createDepartmentDTO: CreateDepartmentDTO,
  ): Promise<Department> {
    return await this.departmentService.createDepartment(createDepartmentDTO);
  }

  @Get(':id/details')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr)
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return this.departmentService.getById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @customRoleDecorator(Roles.Admin, Roles.Hr)
  async deleteDep(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departmentService.deleteDepartment(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr)
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeptDTO: UpdateDepartmentDTO,
  ): Promise<Department> {
    return this.departmentService.updateDepartmentDetails(id, updateDeptDTO);
  }

  @Get(':id/employees')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr)
  async getAllUserOnDepartment(@Param('id',ParseIntPipe) id: number): Promise<DepartmentWithEmployees> {
    return await this.departmentService.getAllUserOnDepartment(id);
  }
}
