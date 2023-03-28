import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional } from 'class-validator';
import { Types, now } from 'mongoose';

export class RoundDto {
  @ApiProperty({ description: 'round ID' })
  id: string;

  @ApiProperty({description: 'round 타이틀', default: 'title'})
  title: string;

  @ApiProperty({description: 'round 정렬 순서'})
  index: number;

  // 속한 이벤트 ID
  @ApiProperty({description: '속한 이벤트 ID'})
  pollRoundEventId?: Types.ObjectId;

  @ApiProperty({description: '활성화 여부', default: false})
  enabled: boolean;

  @ApiProperty({description: '이벤트 라운드 여부', default: false})
  eventRound: boolean;

  @ApiProperty({description: 'round에 포함된 pollIds'})
  pollIds: string[];

  @ApiProperty({
    description: '시작일 (YYYY-MM-DD)',
    required: false,
    default: 'YYYY-MM-DD'
  })
  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @ApiProperty({
    description: '종료일 (YYYY-MM-DD)',
    required: false,
    default: 'YYYY-MM-DD'
  })
  @IsDateString()
  @IsOptional()
  endedAt?: string;
}

export class ResRoundDto {
  @ApiProperty({ description: 'round ID' })
  id: string;

  @ApiProperty({description: 'round 타이틀', default: 'title'})
  title: string;

  @ApiProperty({description: 'round 정렬 순서'})
  index: number;

  @ApiProperty({description: '활성화 여부', default: false})
  enabled: boolean;

  @ApiProperty({description: '이벤트 라운드 여부', default: false})
  eventRound: boolean;

  @ApiProperty({description: 'round에 포함된 pollIds'})
  pollIds: string[];

  @ApiProperty({})
  startedAt?: Date;

  @ApiProperty({})
  endedAt?: Date;
}
