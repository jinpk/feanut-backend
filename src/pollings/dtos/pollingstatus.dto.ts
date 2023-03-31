import { ApiProperty } from '@nestjs/swagger';

export class MyPollingStatusDto {
  @ApiProperty({description: "참여한 투표 수"})
  participated: number;

  @ApiProperty({description: "받은 투표 수"})
  received: number;
}