import { ApiProperty } from '@nestjs/swagger';
import { Emotion } from '../enums'

export class PollDto {
  @ApiProperty({ description: 'poll emotion' })
  emotion: Emotion;

  @ApiProperty({ description: 'poll emoji index' })
  emoji: number;

  @ApiProperty({ description: 'contentText' })
  contentText: string;
  
  @ApiProperty({})
  isOpenedCount: number;
}
