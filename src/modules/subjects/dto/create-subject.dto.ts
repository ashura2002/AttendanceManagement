import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  controlNumber: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subjectDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  unit: number;
}
