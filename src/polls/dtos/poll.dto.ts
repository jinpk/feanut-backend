import { ApiProperty } from '@nestjs/swagger';
import { Emotion } from '../enums'

export class PollDto {
  id: string;

  @ApiProperty({ description: 'poll emotion' })
  emotion: Emotion;

  @ApiProperty({ description: 'contentText' })
  contentText: string;

  @ApiProperty({})
  isOpenedCount: number;
}
