import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PagingReqDto {
  @ApiProperty({
    title: 'page',
    default: 1,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    title: 'limit',
    default: 10,
  })
  @IsNumber()
  limit: number;
}
