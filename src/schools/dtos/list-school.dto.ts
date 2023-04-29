import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { PagingReqDto } from 'src/common/dtos';

export class ListSchoolDto extends PagingReqDto {
  @ApiProperty({ title: '학교명 | 시도 | 시군구' })
  @MinLength(1)
  @IsNotEmpty()
  @IsOptional()
  keyword: string;
}
