import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDTO } from './create-department.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDTO extends PartialType(CreateDepartmentDTO) {
  @IsOptional()
  @IsString()
  departmentName?: string | undefined;

  @IsOptional()
  @IsString()
  description?: string | undefined;
}
