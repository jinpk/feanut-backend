import { ApiProperty, OmitType } from '@nestjs/swagger';
import { now } from 'mongoose';
import { UseCoinDto } from 'src/coins/dtos/coin.dto';

export class UserRoundDto {
  // userId
  @ApiProperty({})
  userId: string;

  // roundId
  @ApiProperty({})
  roundId: string;

  // complete
  @ApiProperty({default: false})
  complete: boolean;

  // poll 목록
  @ApiProperty({})
  pollIds: string[];
  
  // completedAt
  @ApiProperty({})
  completedAt: Date;
}