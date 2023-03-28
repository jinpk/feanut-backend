import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional } from 'class-validator';
import { Types, now } from 'mongoose';

export class PollRoundEventDto {
  @ApiProperty({ description: 'roundEvent ID' })
  id?: string;

  @ApiProperty({description: '메인 Message', default: 'message', required: true})
  message: string;

  @ApiProperty({description: '서브 Message', default: 'submessage', required: true})
  subMessage: string;

  @ApiProperty({ description: 'sub message에서 강조할 문장' })
  markingText?: string;

  // 속한 이벤트 ID
  @ApiProperty({description: 'emoji ID', required: true})
  emojiId: Types.ObjectId;

  @ApiProperty({description: '리워드 수량', required: true, default: 0})
  resward: number;
}