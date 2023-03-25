import { ApiProperty } from '@nestjs/swagger';
import { Emotion } from '../../polls/enums';

export class PublicEmojiDto {
  @ApiProperty({ description: 'emotion' })
  emotion: Emotion;

  @ApiProperty({})
  assetKey: string;
}

export class EmojiDto {
  @ApiProperty({ description: 'emotion' })
  emotion: Emotion;

  @ApiProperty({})
  fileId: string;
}
