import { ApiProperty } from '@nestjs/swagger';

export class PollDto {
  @ApiProperty({ description: 'pollId' })
  id: string;

  @ApiProperty({ description: 'profileId' })
  profileId: string;
}
