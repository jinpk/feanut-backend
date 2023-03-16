import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class GetPollingDto extends PagingReqDto {
  @ApiProperty({ 
    description: 'userId',
    required: false,
  })
  userId: string;
}
