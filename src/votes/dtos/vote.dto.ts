import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty({ description: 'voteId' })
  id: string;

  @ApiProperty({ description: 'profileId' })
  profileId: string;
}
