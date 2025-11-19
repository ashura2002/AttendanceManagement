import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { SubjectDays } from 'src/common/enums/scheduleSubject.enum';

export class UpdateSubjectScheduleDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, {
    message: 'Time must be in the format hh:mm AM/PM',
  })
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, {
    message: 'Time must be in the format hh:mm AM/PM',
  })
  endTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(SubjectDays, { each: true })
  days: SubjectDays[];
}
