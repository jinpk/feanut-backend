import { ApiProperty } from '@nestjs/swagger';

export class CoinDto {
  @ApiProperty({ description: 'coinId' })
  id: string;

  @ApiProperty({ description: 'profileId' })
  profileId: string;

  @ApiProperty({ description: 'total feanuts count' })
  total: number;
}
