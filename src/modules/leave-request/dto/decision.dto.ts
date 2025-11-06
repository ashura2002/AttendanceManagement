import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ResultStatus } from 'src/common/enums/leaveStatus.enum';

export class DecisionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ResultStatus)
  status: ResultStatus;
}
