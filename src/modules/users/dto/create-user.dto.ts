import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Roles } from 'src/common/enums/Roles.enum';

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(3)
  userName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(3)
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(3)
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(3)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  role: Roles;
}
