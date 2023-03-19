import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';
import { UseCoinDto } from 'src/coins/dtos/coin.dto';

export class PollingDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'total feanuts count' })
  total: number;

  @ApiProperty({ description: 'feanuts accum logs' })
  accumLogs: number[];
}

export class PollingOpenDto extends UseCoinDto {
    @ApiProperty({
        description: 'profileId',
        required: true,
    })
    profileId: string;
  }