import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateNotificationDTO {
  @ApiProperty()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  user: number;
}
