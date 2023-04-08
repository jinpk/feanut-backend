import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class PagingReqDto {
  @ApiProperty({
    title: 'page',
    default: 1,
  })
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    title: 'limit',
    default: 10,
  })
  @IsNotEmpty()
  limit: number;
}

export class OptionalPagingReqDto {
  @ApiProperty({
    title: 'page',
    default: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    title: 'limit',
    default: 10,
    required: false,
  })
  limit?: number;
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
