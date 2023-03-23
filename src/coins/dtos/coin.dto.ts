import { ApiProperty } from '@nestjs/swagger';
import { BuyType } from '../enums';
import { UseType } from '../enums/usetype.enum';
import { now } from 'mongoose';

export class CoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'total feanuts count' })
  total: number;

  @ApiProperty({ description: 'feanuts accum logs' })
  accumLogs: number[];
}

export class BuyCoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({})
  buyType: BuyType;

  @ApiProperty({required: true})
  productId: string;

  @ApiProperty({required: true})
  token: string;

  @ApiProperty({})
  amount: number;
}

export class UseCoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({})
  useType: UseType;

  @ApiProperty({})
  amount: number;
}