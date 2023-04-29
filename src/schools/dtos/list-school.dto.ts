import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length, MinLength } from 'class-validator';
import { PagingReqDto } from 'src/common/dtos';

export class ListSchoolDto extends PagingReqDto {
  @ApiProperty({ title: '학교명' })
  @MinLength(1)
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
