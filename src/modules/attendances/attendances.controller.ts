import { Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AttendancesService } from './attendances.service';

@Controller('attendances')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AttendancesController {
    constructor(private readonly attendanceService: AttendancesService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async timeIn(@Req() req): Promise<any> {
        const { userId } = req.user
        return await this.attendanceService.timeIn(userId)
    }
}
