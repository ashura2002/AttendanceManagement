import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { JwtModule } from '@nestjs/jwt';
import { BuildingModule } from '../buildings/buildings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), JwtModule, BuildingModule],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
