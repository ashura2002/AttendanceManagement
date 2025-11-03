import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  password: string;
}
