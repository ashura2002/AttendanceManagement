import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ScheduleSubject } from 'src/common/enums/scheduleSubject.enum';

export class UpdateAssignmentDTO {
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
}
