import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AssignmentModule } from '../assignments/assignment.module';
import { LeaveRequestModule } from '../leave-request/leave-request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    JwtModule,
    UsersModule,
    AssignmentModule,
    LeaveRequestModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class attendanceModule {}
