import { ApiProperty } from '@nestjs/swagger';

export class PagingReqDto {
  @ApiProperty({
    title: 'page',
    default: 1,
  })
  page: number;

  @ApiProperty({
    title: 'limit',
    default: 10,
  })
  limit: number;
}
