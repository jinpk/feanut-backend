import { ApiProperty } from '@nestjs/swagger';
import { MajorDto } from './major.dto';

export class SchoolDto {
  @ApiProperty({
    title: '학교명',
    required: false,
  })
  name: string;

  @ApiProperty({
    title: '학교 로고 S3 Path',
    required: false,
  })
  logoPath: string;

  @ApiProperty({
    title: '학과 목록',
    required: false,
    type: [MajorDto],
  })
  majors: [MajorDto];
}

export class SchoolJoinedDto extends SchoolDto {
  @ApiProperty({
    title: '학교 가입자 수',
    required: false,
  })
  joinedCount: number;
}
