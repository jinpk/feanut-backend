import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class GetListPollingDto extends PagingReqDto {
  @ApiProperty({
    description: 'userId',
    required: false,
  })
  userId: string;
}

export class GetListReceivePollingDto extends PagingReqDto {}

export class GetPollingDto {
  @ApiProperty({
    description: 'pollingId',
  })
  pollingId: string;
}
