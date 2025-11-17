import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { UsersModule } from '../users/users.module';
import { SubjectAssignmentModule } from '../subjectAssignment/subjectAssignment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    JwtModule,
    UsersModule,
    SubjectAssignmentModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
