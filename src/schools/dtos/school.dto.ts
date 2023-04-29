import { ApiProperty } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';

export class SchoolDto {
  @ApiProperty({ title: '학교명' })
  name: string;

  @ApiProperty({ title: '학교주소' })
  address: string;

  @ApiProperty({ title: '학교코드' })
  code: string;

  @ApiProperty({ title: '시' })
  sido: string;

  @ApiProperty({ title: '군구' })
  sigungu: string;
}
