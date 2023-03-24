import { PartialType, ApiProperty } from '@nestjs/swagger';
import { EmojiDto } from './emoji.dto';

export class UpdateEmojiDto extends PartialType(EmojiDto) {
    // fileId
    @ApiProperty({})
    fileId: string;
    
    @ApiProperty({})
    isDeleted: boolean;
}