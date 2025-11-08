import { IsNotEmpty } from 'class-validator';

export class UpdateBuildingDTO {
  @IsNotEmpty()
  buildingName: string;
}
