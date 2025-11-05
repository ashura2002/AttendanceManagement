import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { LeaveType } from 'src/common/enums/leaveType.enum';

export class CreateLeaveRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  leaveType: LeaveType;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsNotEmpty()
  @IsInt()
  @IsOptional()
  user: number;
}
