import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDTO {
  @IsNotEmpty()
  @IsString()
  departmentName: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
