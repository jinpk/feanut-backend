import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { CoinDto } from './coin.dto';

export class UpdateCoinDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty()
  amount: number;
}
