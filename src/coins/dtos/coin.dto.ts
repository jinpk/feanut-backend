import { ApiProperty } from '@nestjs/swagger';
import { BuyType } from '../enums';
import { UseType } from '../enums/usetype.enum';
import { now } from 'mongoose';
import { OS } from 'src/common/enums';

export class CoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'total feanuts count' })
  total: number;

  @ApiProperty({ description: 'feanuts accum logs' })
  accumLogs: number[];
}

export class PurchaseCoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ required: true })
  productId: string;

  @ApiProperty({
    required: true,
    description: 'android - token, ios - receipt',
  })
  purchaseReceipt: string;

  @ApiProperty({
    required: true,
    enum: OS,
  })
  os: OS;
}

export class UseCoinDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({})
  useType: UseType;

  @ApiProperty({})
  amount: number;
}
