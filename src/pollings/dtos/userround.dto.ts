import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Types, now } from 'mongoose';
import { UseCoinDto } from 'src/coins/dtos/coin.dto';

export class UserRoundDto {
  id?: string;
  // userId
  @ApiProperty({})
  userId: string;

  // roundId
  @ApiProperty({})
  roundId: string;

  // poll 목록
  @ApiProperty({})
  pollIds: string[];

  // pollingIds 목록
  @ApiProperty({})
  pollingIds: Types.ObjectId[];

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
  recentCompletedAt: Date;

  @ApiProperty({})
  remainTime: number;
  
  @ApiProperty({})
  data: UserRoundDto;
}

export class PayUserRoundDto extends OmitType(UseCoinDto, [
  'userId',
] as const) {}
