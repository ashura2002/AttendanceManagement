import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('attendances')
@ApiBearerAuth('access-token')
@SkipThrottle() // --- TEMPORARY RANI 
@UseGuards(JwtAuthGuard, RoleGuard)
export class AttendancesController {
  constructor(private readonly attendanceService: AttendancesService) {}

  @Post('time-in')
  @HttpCode(HttpStatus.CREATED)
  async timeIn(@Req() req): Promise<Attendance> {
    const { userId } = req.user;
    return await this.attendanceService.timeIn(userId);
  }

  @Post('time-out')
  @HttpCode(HttpStatus.CREATED)
  async timeOut(@Req() req): Promise<Attendance> {
    const { userId } = req.user;
    return await this.attendanceService.timeOut(userId)
  }
}
