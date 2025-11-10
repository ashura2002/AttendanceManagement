import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentSubject } from './entities/assignment.entity';
import { JwtModule } from '@nestjs/jwt';
import { SubjectModule } from '../subjects/subject.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignmentSubject]),
    JwtModule,
    SubjectModule,
    UsersModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
