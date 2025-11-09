import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRoomDTO {
  @ApiProperty()
  @IsNotEmpty()
  roomName: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  building: number;
}
