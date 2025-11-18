import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';

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
    return await this.attendanceService.timeOut(userId);
  }

  @Get('employee/by-date')
  @HttpCode(HttpStatus.OK)
  async getAllOwnAttendanceBydate(
    @Req() req,
    @Query('date') date: Date,
  ): Promise<Attendance[]> {
    const { userId } = req.user;
    return await this.attendanceService.getAllOwnAttendanceByDate(userId, date);
  }

  @Get('admin/:id/employees-attendance-by-date')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.ProgramHead, Roles.Hr)
  async getEmployeesAttendanceByDate(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: Date,
  ): Promise<Attendance[]> {
    return await this.attendanceService.getEmployeesAttendanceByDate(id, date);
  }
}
