import { ApiProperty } from '@nestjs/swagger';
import { SchoolLevels } from '../enums';

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

  @ApiProperty({ title: '가입수' })
  joinedCount: number;

  @ApiProperty({ title: '학교 레벨', enum: SchoolLevels })
  level: SchoolLevels;
}
