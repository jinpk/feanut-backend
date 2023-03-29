import { ApiProperty } from '@nestjs/swagger';

export class EmojiDto {
  @ApiProperty({ description: 'emojiId' })
  id: string;

  @ApiProperty({ description: 'Asset Key' })
  key: string;
}
