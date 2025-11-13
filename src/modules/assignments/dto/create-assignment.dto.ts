import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ScheduleSubject } from 'src/common/enums/scheduleSubject.enum';

export class CreateSubjectAssignmentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  subjects: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  room: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ScheduleSubject, { each: true })
  daySchedule: ScheduleSubject[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  user: number;
}
