import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Types} from 'mongoose';
import { UseCoinDto } from 'src/coins/dtos/coin.dto';
import { FriendDto } from 'src/friendships/dtos';

export class Opened {
  // isOpened
  @ApiProperty({ default: false })
  isOpened: boolean;

  // useCoinId
  @ApiProperty({ default: null })
  useCoinId: string;
}

export class PollingDto {
  @ApiProperty({})
  id?: string

  // userId
  @ApiProperty({})
  userId: string;

  // userroundId
  @ApiProperty({})
  userroundId: Types.ObjectId;

  // pollId
  @ApiProperty({})
  pollId: string;

  // friendList
  @ApiProperty({})
  friendIds: [Types.ObjectId[]];

  // selectedId
  @ApiProperty({default: null})
  selectedProfileId: string;

  // skipped
  @ApiProperty({default: null})
  skipped: string;

  @ApiProperty({default: 0})
  refreshCount: number;

  // selectedAt
  @ApiProperty({default: null})
  selectedAt: Date;

  // isOpened
  @ApiProperty({})
  isOpened: boolean;

  // 생성시간
  @ApiProperty()
  createdAt?: Date;
}

export class PollingOpenDto extends OmitType(UseCoinDto, ['userId']) {
  @ApiProperty({
    description: 'profileId',
    required: true,
  })
  profileId: string;
}

export class ReqNewPollingDto {
  @ApiProperty({required: true})
  pollId: string;
  
  @ApiProperty({required: true})
  userRoundId: string;
}

export class PollingResultDto {
  @ApiProperty({default: false})
  userroundCompleted: boolean;

  @ApiProperty({default: 0})
  roundReward: number;
}

export class PollingFriendDto extends OmitType(FriendDto, [
  'username',
  'hidden',
]){}