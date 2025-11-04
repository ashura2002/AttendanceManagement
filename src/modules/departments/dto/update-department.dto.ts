import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDTO } from './create-department.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDTO extends PartialType(CreateDepartmentDTO) {
  @ApiProperty()
  @IsOptional()
  @IsString()
  departmentName?: string | undefined;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string | undefined;
}
