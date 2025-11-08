import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateRoomDTO {
  @ApiProperty()
  @IsNotEmpty()
  roomName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  building: number;
}
