import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateNotificationDTO {
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  @IsInt()
  user: number;
}
