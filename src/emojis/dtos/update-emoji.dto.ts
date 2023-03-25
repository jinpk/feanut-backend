import { PartialType, ApiProperty } from '@nestjs/swagger';
import { EmojiDto } from './emoji.dto';

export class UpdateEmojiDto extends PartialType(EmojiDto) {
    @ApiProperty({default:false})
    isDeleted: boolean;
}