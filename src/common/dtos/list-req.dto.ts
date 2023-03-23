import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

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

export class DateReqDto {
  @ApiProperty({
    description: '조회 시작일 (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly start: string;

  @ApiProperty({
    description: '조회 종료일 (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly end: string;
}
