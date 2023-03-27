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

  // poll 목록
  @ApiProperty({})
  pollIds: string[];

  // complete
  @ApiProperty({ default: false })
  complete?: boolean;

  // completedAt
  @ApiProperty({})
  completedAt?: Date;
}

export class FindUserRoundDto {
  @ApiProperty({})
  todayCount: number;

  @ApiProperty({})
  recentCompleteAt: Date;  
  
  @ApiProperty({})
  data: UserRoundDto;
}

export class PayUserRoundDto extends OmitType(UseCoinDto, [
  'userId',
] as const) {}
