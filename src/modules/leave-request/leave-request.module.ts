import { Module } from '@nestjs/common';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestService } from './leave-request.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), JwtModule, UsersModule],
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService],
})
export class LeaveRequestModule {}
