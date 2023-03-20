import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class GetListPollDto extends PagingReqDto {
  @ApiProperty({ 
    description: 'userId',
    required: false,
  })
  userId: string;
}

export class GetListRoundDto extends PagingReqDto{
  @ApiProperty({ 
    description: 'userId',
    required: false,
  })
  userId: string;
}

export class GetListPublicPollDto extends PagingReqDto{}
