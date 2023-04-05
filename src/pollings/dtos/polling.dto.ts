import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { FriendDto } from 'src/friendships/dtos';
import { PollRoundEventDto } from 'src/polls/dtos/round-event.dto';

export class PollingDto {
  @ApiProperty({})
  id?: string;

  // userId
  @ApiProperty({})
  userId: Types.ObjectId;

  // userRoundId
  @ApiProperty({})
  userRoundId: Types.ObjectId;

  // pollId
  @ApiProperty({})
  pollId: Types.ObjectId;

  // friendList
  @ApiProperty({})
  friendIds: Object[][];

  // selectedId
  @ApiProperty({ default: null })
  selectedProfileId: Types.ObjectId;

  // skipped
  @ApiProperty({ default: null })
  skipped: boolean;

  @ApiProperty({ default: 0 })
  refreshCount: number;

  // completedAt
  @ApiProperty({ default: null })
  completedAt: Date;

  // isOpened
  @ApiProperty({})
  isOpened: boolean;

  // isVoted
  @ApiProperty({})
  isVoted: boolean;

  // useCoinId
  @ApiProperty({ default: null })
  useCoinId?: Types.ObjectId;

  // 생성시간
  @ApiProperty()
  createdAt?: Date;
}

export class ReqNewPollingDto {
  @ApiProperty({ required: true })
  pollId: string;

  @ApiProperty({ required: true })
  userRoundId: string;
}

export class PollingResultDto {
  @ApiProperty({ default: false })
  userroundCompleted: boolean;

  @ApiProperty({})
  roundEvent: PollRoundEventDto;
}

export class PollingFriendDto extends OmitType(FriendDto, ['hidden']) {}

export class ReceivePollingDto {
  @ApiProperty({})
  id?: string;

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
  friendIds: Types.ObjectId[][];

  // selectedId
  @ApiProperty({ default: null })
  selectedProfileId: Types.ObjectId;

  // completedAt
  @ApiProperty({ default: null })
  completedAt: Date;
}
