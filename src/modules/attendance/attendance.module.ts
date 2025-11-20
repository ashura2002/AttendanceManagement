import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Attendance } from './entities/attendance.entity';
import { UsersModule } from '../users/users.module';
import { SubjectAssignmentModule } from '../subject-assignment/subject-assignment.module';

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
