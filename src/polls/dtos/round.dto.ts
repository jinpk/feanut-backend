import { ApiProperty } from '@nestjs/swagger';
import { DateReqDto } from 'src/common/dtos';

export class RoundDto{
  id: string;

  @ApiProperty({})
  enabled: boolean;

  @ApiProperty({})
  pollIds: string[];

  @ApiProperty({})
  startedAt?: Date;

  @ApiProperty({})
  endedAt?: Date;

  @ApiProperty({})
  createdAt?: Date;
}
