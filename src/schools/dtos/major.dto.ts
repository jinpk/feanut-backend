import { ApiProperty } from '@nestjs/swagger';

export class MajorDto {
  @ApiProperty({
    title: '학과명',
  })
  name: string;
}
