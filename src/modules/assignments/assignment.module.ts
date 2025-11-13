import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentSubject } from './entities/assignment.entity';
import { JwtModule } from '@nestjs/jwt';
import { SubjectModule } from '../subjects/subject.module';
import { UsersModule } from '../users/users.module';
import { RoomModule } from '../rooms/room.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignmentSubject]),
    JwtModule,
    SubjectModule,
    UsersModule,
    RoomModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
