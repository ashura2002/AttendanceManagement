import { Module } from '@nestjs/common';
import { SubjectAssignmentController } from './subjectAssignment.controller';
import { subjectAssignmentService } from './subjectAssignment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectAssignment } from './entities/subjectAssignment.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { SubjectModule } from '../subjects/subject.module';
import { RoomModule } from '../rooms/room.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubjectAssignment]),
    JwtModule,
    UsersModule,
    SubjectModule,
    RoomModule,
  ],
  controllers: [SubjectAssignmentController],
  providers: [subjectAssignmentService],
  exports: [subjectAssignmentService],
})
export class SubjectAssignmentModule {}
