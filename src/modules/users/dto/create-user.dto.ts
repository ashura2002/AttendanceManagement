import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  @MinLength(3)
  userName: string;

  @IsNotEmpty()
  @MinLength(3)
  displayName: string;

  @IsNotEmpty()
  @MinLength(3)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(3)
  password: string;
}
