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
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';

@Controller('attendance')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('time-in')
  @HttpCode(HttpStatus.CREATED)
  @customRoleDecorator(Roles.Employee)
  async timeIn(@Req() req): Promise<any> {
    const { userId } = req.user;
    return await this.attendanceService.timeIn(userId);
  }

  @Post('time-out')
  @customRoleDecorator(Roles.Employee)
  @HttpCode(HttpStatus.CREATED)
  async timeOut(@Req() req): Promise<any> {
    const { userId } = req.user;
    return await this.attendanceService.timeOut(userId);
  }
}
