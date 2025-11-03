import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Roles } from 'src/common/enums/Roles.enum';

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

  @IsNotEmpty()
  role: Roles;
}
