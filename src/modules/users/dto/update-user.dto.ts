import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { IsInt, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @IsOptional()
  @MinLength(3)
  userName?: string | undefined;

  @IsOptional()
  @MinLength(3)
  displayName?: string | undefined;

  @IsOptional()
  @MinLength(3)
  password?: string | undefined;

  @IsOptional()
  @IsInt()
  department?: number | null | undefined
}
