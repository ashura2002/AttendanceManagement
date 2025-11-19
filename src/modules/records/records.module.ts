import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRecord } from './entities/record.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserRecord]), JwtModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
