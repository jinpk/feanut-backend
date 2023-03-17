import { ApiProperty } from '@nestjs/swagger';

export class RoundDto {
  id: string;

  @ApiProperty({})
  enbaled: boolean;

  @ApiProperty({})
  pollIds: string[];

  @ApiProperty({})
  startedAt?: Date;

  @ApiProperty({})
  endedAt?: Date;
}
