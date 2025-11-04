import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Department]), JwtModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports:[DepartmentsService]
})
export class DepartmentsModule {}
