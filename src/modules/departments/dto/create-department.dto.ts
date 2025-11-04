import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  departmentName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;
}
