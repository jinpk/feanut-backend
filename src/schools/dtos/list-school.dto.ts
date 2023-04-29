import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length, MinLength } from 'class-validator';
import { PagingReqDto } from 'src/common/dtos';

export class ListSchoolDto extends PagingReqDto {
  @ApiProperty({ title: '우편번호', required: false, description: '000-00' })
  @Length(6)
  @IsNotEmpty()
  @IsOptional()
  zipcode: string;

  @ApiProperty({ title: '학교명' })
  @MinLength(2)
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
