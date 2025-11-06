import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveStatus } from 'src/common/enums/leaveStatus.enum';
import { LeaveType } from 'src/common/enums/leaveType.enum';

export class CreateLeaveRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  leaveType: LeaveType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  status?: LeaveStatus;

  @IsNotEmpty()
  @IsInt()
  @IsOptional()
  totalLeaveDays?: number;
}
