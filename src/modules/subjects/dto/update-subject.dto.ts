import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubjectDTO {
  @ApiProperty()
  @IsNotEmpty()
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
