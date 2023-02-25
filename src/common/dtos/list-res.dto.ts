import { ApiProperty } from '@nestjs/swagger';

export class PagingResDto<T> {
  @ApiProperty({
    title: 'results',
  })
  data: T[];

  @ApiProperty({
    title: 'total',
  })
  total: number;
}
