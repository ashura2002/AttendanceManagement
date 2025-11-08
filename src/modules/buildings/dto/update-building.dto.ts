import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateBuildingDTO {
  @ApiProperty()
  @IsNotEmpty()
  buildingName: string;

  @ApiProperty()
  @IsNotEmpty()
  location: string;
}
