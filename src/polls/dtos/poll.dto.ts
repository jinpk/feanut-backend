import { ApiProperty } from '@nestjs/swagger';
import { Emotion } from '../enums';

export class PollDto {
  @ApiProperty({ description: 'poll ID' })
  id: string;

  @ApiProperty({ description: 'poll emotion' })
  emotion: Emotion;

  @ApiProperty({ description: 'poll emoji' })
  emojiId: string;

  @ApiProperty({ description: 'contentText' })
  contentText: string;

  @ApiProperty({})
  isOpenedCount: number;

  @ApiProperty({})
  createdAt?: Date;
}
