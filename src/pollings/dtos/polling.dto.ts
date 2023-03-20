import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';
import { UseCoinDto } from 'src/coins/dtos/coin.dto';

export class PollingDto {
  // userId
  @ApiProperty({})
  userId: string;

  // roundId
  @ApiProperty({})
  roundId: string;

  // pollIds
  @ApiProperty({})
  pollIds: string[];

  // pollId
  @ApiProperty({})
  pollId: string;

  // friendList
  @ApiProperty({})
  friendIds: string[];

  // selectedId
  @ApiProperty({})
  selectedProfileId: string;

  @ApiProperty({})
  refreshCount: number;
  
  // selectedAt
  @ApiProperty({})
  selectedAt: Date;

  // isOpened
  @ApiProperty({default: false})
  isOpened: boolean;

  // 생성시간
  @ApiProperty()
  createdAt?: Date;
}

export class PollingOpenDto extends UseCoinDto {
  @ApiProperty({
      description: 'profileId',
      required: true,
  })
  profileId: string;
}

export class PollingRefreshDto extends UseCoinDto {
  @ApiProperty({
      description: 'profileId',
      required: true,
  })
  profileId: string;
}