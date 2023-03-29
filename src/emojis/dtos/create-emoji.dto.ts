import { ApiProperty } from '@nestjs/swagger';

export class CreateEmojiDto {
  @ApiProperty({ description: 'fileId' })
  fileId: string;
}
