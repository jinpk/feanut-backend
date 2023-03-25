import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class GetListEmojiDto extends PagingReqDto {
  @ApiProperty({required: false})
  emotion: string;
}
