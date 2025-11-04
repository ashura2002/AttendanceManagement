import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { IsInt, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @ApiProperty()
  @IsOptional()
  @MinLength(3)
  userName?: string | undefined;

  @ApiProperty()
  @IsOptional()
  @MinLength(3)
  displayName?: string | undefined;

  @ApiProperty()
  @IsOptional()
  @MinLength(3)
  password?: string | undefined;
}
