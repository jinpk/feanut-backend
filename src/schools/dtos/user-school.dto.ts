import { ApiProperty } from '@nestjs/swagger';

export class UserSchoolDto {
  @ApiProperty({ title: '학교명' })
  name: string;

  @ApiProperty({ title: '학년' })
  grade: number;

  @ApiProperty({ title: '반', default: "1" })
  room: string;

  @ApiProperty({ title: '학교코드' })
  code: string;

  @ApiProperty()
  updatedAt: Date;
}
