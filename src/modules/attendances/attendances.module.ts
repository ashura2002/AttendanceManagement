import { Module } from '@nestjs/common';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { SubjectAssignmentModule } from '../subjectAssignment/subjectAssignment.module';
import { LeaveRequestModule } from '../leave-request/leave-request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    JwtModule,
    UsersModule,
    SubjectAssignmentModule,
    LeaveRequestModule,
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
