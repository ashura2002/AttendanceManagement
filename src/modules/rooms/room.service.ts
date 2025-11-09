import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDTO } from './dto/create-room.dto';
import { BuildingService } from '../buildings/buildings.service';
import { UpdateBuildingDTO } from '../buildings/dto/update-building.dto';
import { UpdateRoomDTO } from './dto/update-room.dt';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    private readonly buildingService: BuildingService,
  ) {}

  async getAllRooms(): Promise<Room[]> {
    const rooms = await this.roomRepo.find({ relations: ['building'] });
    return rooms;
  }

  async createRoom(createRoomDTO: CreateRoomDTO): Promise<any> {
    const existingRoom = await this.roomRepo.findOne({
      where: { roomName: createRoomDTO.roomName },
    });
    if (existingRoom) throw new BadRequestException('Rooms already exist');
    const building = await this.buildingService.getBuildingById(
      createRoomDTO.building,
    );
    const room = this.roomRepo.create({
      ...createRoomDTO,
      building: building,
    });
    return await this.roomRepo.save(room);
  }

  async getRoomById(id: number): Promise<Room> {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: ['building'],
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async updateRoom(id: number, updateRoomDTO: UpdateRoomDTO): Promise<Room> {
    const room = await this.roomRepo.findOne({
      where: { id },
    });
    if (!room) throw new NotFoundException('Room not found');
    const building = await this.buildingService.getBuildingById(
      updateRoomDTO.building,
    );
    const updatedRooms = {
      ...updateRoomDTO,
      building: building,
    };
    Object.assign(room, updatedRooms);
    return await this.roomRepo.save(room);
  }
}
// to do -> add update room - DONE
//      -> try to fix updated with same name return error exception
//      -> add remove room
