import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';

export class PollingDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'total feanuts count' })
  total: number;

  @ApiProperty({ description: 'feanuts accum logs' })
  accumLogs: number[];
}