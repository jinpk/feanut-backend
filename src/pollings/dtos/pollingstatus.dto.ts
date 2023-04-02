import { ApiProperty } from '@nestjs/swagger';

export class PollingStatsDto {
  @ApiProperty({description: "참여한 투표 수"})
  pollsCount: number;

  @ApiProperty({description: "받은 투표 수"})
  pullsCount: number;
}