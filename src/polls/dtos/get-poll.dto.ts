import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class GetListPollDto extends PagingReqDto {
  @ApiProperty({
    description: 'emotion',
    required: false,
  })
  emotion: string;
}

export class GetListRoundDto extends PagingReqDto {}

export class GetListPublicPollDto extends PagingReqDto {}
