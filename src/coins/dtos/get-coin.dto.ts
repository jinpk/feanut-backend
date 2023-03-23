import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class GetBuyCoinDto extends PagingReqDto {
  @ApiProperty({ 
    description: 'userId',
    required: true,
  })
  userId: string;
}

export class GetUseCoinDto extends PagingReqDto{
  @ApiProperty({ 
    description: 'userId',
    required: false,
  })
  userId: string;
}
