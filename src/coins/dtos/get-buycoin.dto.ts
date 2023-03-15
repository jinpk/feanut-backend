import { ApiProperty } from '@nestjs/swagger';

export class GetBuyCoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;
}
