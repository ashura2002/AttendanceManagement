import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDepartmentDTO } from './dto/create-department.dto';
import { UpdateDepartmentDTO } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  async getAllDepartments(): Promise<Department[]> {
    const departments = await this.departmentRepo.find();
    return departments;
  }

  async createDepartment(
    createDepartmentDTO: CreateDepartmentDTO,
  ): Promise<Department> {
    const existDeptName = await this.departmentRepo.findOne({
      where: { departmentName: createDepartmentDTO.departmentName },
    });
    if (existDeptName)
      throw new BadRequestException(
        `${createDepartmentDTO.departmentName} is already exist!`,
      );
    const department = this.departmentRepo.create(createDepartmentDTO);
    return await this.departmentRepo.save(department);
  }

  async getById(id: number): Promise<Department> {
    const department = await this.departmentRepo.findOne({
      where: { id },
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async deleteDepartment(id: number): Promise<void> {
    const department = await this.departmentRepo.findOne({
      where: { id },
    });
    if (!department) throw new NotFoundException('Department not found!');
    await this.departmentRepo.remove(department);
  }

  async updateDepartmentDetails(
    departmentID: number,
    updateDeptDTO: UpdateDepartmentDTO,
  ): Promise<Department> {
    const departmentExist = await this.departmentRepo.findOne({
      where: { id: departmentID },
    });
    if (!departmentExist) throw new NotFoundException('Department not exist');

    Object.assign(departmentExist, updateDeptDTO);
    return await this.departmentRepo.save(departmentExist);
  }
}

// to do -> add a controller for assign employee for this department DONE
// Fetch all employee on particular department
// add swagger UI
