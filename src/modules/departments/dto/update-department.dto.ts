import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDTO } from './create-department.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;
}
