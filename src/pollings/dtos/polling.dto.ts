import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UseCoinDto } from 'src/coins/dtos/coin.dto';

export class Opened {
  // isOpened
  @ApiProperty({ default: false })
  isOpened: boolean;

  // useCoinId
  @ApiProperty({ default: null })
  useCoinId: string;
}

export class PollingDto {
  // userId
  @ApiProperty({})
  userId: string;

  // userroundId
  @ApiProperty({})
  userroundId: string;

  // roundId
  @ApiProperty({})
  roundId: string;

  // pollId
  @ApiProperty({})
  pollId: string;

  // friendList
  @ApiProperty({})
  friendIds: string[];

  // selectedId
  @ApiProperty({})
  selectedProfileId: string;

  // skipped
  @ApiProperty({default: false})
  skipped: string;

  @ApiProperty({})
  refreshCount: number;

  // selectedAt
  @ApiProperty({})
  selectedAt: Date;

  // isOpened
  @ApiProperty({})
  opened: Opened;

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
  // 
  @ApiProperty({})
  userId: string;
}