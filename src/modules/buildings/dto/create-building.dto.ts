import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBuildingDTO {
  @ApiProperty()
  @IsNotEmpty()
  buildingName: string;

  @ApiProperty()
  @IsNotEmpty()
  location: string;
}
