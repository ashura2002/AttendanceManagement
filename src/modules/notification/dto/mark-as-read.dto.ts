import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class MarkAsReadDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;
}
