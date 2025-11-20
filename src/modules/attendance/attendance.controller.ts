import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('attendance')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('time-in')
  @HttpCode(HttpStatus.OK)
  async timeIn(@Req() req): Promise<any> {
    const { userId } = req.user;
    return await this.attendanceService.timeIn(userId)
  }

  
  @Post('time-out')
  @HttpCode(HttpStatus.OK)
  async timeOut(@Req() req): Promise<any> {
    const { userId } = req.user;
    return await this.attendanceService.timeOut(userId)
  }
}
