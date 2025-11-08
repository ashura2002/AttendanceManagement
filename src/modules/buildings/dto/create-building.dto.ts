import { IsNotEmpty } from 'class-validator';

export class CreateBuildingDTO {
  @IsNotEmpty()
  buildingName: string;
}
