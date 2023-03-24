import { ApiProperty } from '@nestjs/swagger';
import { Emotion } from '../../polls/enums'

export class EmojiDto {
  @ApiProperty({ description: 'emotion' })
  emotion: Emotion;

  @ApiProperty({})
  emojiFilePath: number;

  @ApiProperty({ description: 'contentText' })
  contentText: string;
  
  @ApiProperty({})
  isDeleted: boolean;

  @ApiProperty({})
  createdAt?: Date;
}