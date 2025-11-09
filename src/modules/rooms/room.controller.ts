import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RoomService } from './room.service';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { Room } from './entities/room.entity';
import { CreateRoomDTO } from './dto/create-room.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateRoomDTO } from './dto/update-room.dt';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('access-token')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getAllRooms(): Promise<Room[]> {
    return await this.roomService.getAllRooms();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async createRoom(@Body() createRoomDTO: CreateRoomDTO): Promise<Room> {
    return await this.roomService.createRoom(createRoomDTO);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedRoomDTO: UpdateRoomDTO,
  ): Promise<Room> {
    return this.roomService.updateRoom(id, updatedRoomDTO);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getRoomById(@Param('id', ParseIntPipe) id: number): Promise<Room> {
    return this.roomService.getRoomById(id);
  }
}

