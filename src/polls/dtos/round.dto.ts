import { ApiProperty } from '@nestjs/swagger';

export class RoundDto {
  id: string;

  @ApiProperty({})
  enabled: boolean;

  @ApiProperty({})
  pollIds?: string[];

  @ApiProperty({})
  startedAt?: Date;

  @ApiProperty({})
  endedAt?: Date;
}
