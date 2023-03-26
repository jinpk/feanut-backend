import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';
import { OS } from 'src/common/enums';
import { UseType } from '../enums/usetype.enum';

export class CoinDto {
  id: string;

  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'total feanuts count' })
  total: number;

  @ApiProperty({ description: 'feanuts accum logs' })
  accumLogs: number[];
}

export class PurchaseCoinDto {
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
