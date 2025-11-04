import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignDeptDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  department: number;
}
