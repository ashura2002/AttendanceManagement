import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiProperty()
  @IsOptional()
  @MinLength(3)
  @IsNotEmpty()
  userName: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(3)
  @IsNotEmpty()
  displayName: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(3)
  @IsNotEmpty()
  password: string;
}
