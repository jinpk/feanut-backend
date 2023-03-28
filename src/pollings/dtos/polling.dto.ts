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
  userId: Types.ObjectId;

  // userroundId
  @ApiProperty({})
  userroundId: Types.ObjectId;

  // pollId
  @ApiProperty({})
  pollId: Types.ObjectId;

  // friendList
  @ApiProperty({})
  friendIds: [Types.ObjectId[]];

  // selectedId
  @ApiProperty({default: null})
  selectedProfileId: Types.ObjectId;

  // skipped
  @ApiProperty({default: null})
  skipped: boolean;

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



export class ReceivePollingDto {
  @ApiProperty({})
  id?: string

  // userId
  @ApiProperty({})
  userId: Types.ObjectId;

  @ApiProperty({})
  userName: string;

  @ApiProperty({})
  userImageFileId: Types.ObjectId;

  // pollId
  @ApiProperty({})
  pollId: Types.ObjectId;

  // friendList
  @ApiProperty({})
  friendIds: [Types.ObjectId[]];

  // selectedId
  @ApiProperty({default: null})
  selectedProfileId: Types.ObjectId;

  // selectedAt
  @ApiProperty({default: null})
  selectedAt: Date;
}