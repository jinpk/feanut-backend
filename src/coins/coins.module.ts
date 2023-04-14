import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coin, CoinSchema } from './schemas/coin.schema';
import { BuyCoin, BuyCoinSchema } from './schemas/buycoin.schema';
import { UseCoin, UseCoinSchema } from './schemas/usecoin.schema';
import { CoinsController, CoinsPublicController } from './coins.controller';
import { CoinsService } from './conis.service';
import { HttpModule } from '@nestjs/axios';
import { IAPValidatorProvider } from './providers/iap-validator.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coin.name, schema: CoinSchema }]),
    MongooseModule.forFeature([{ name: BuyCoin.name, schema: BuyCoinSchema }]),
    MongooseModule.forFeature([{ name: UseCoin.name, schema: UseCoinSchema }]),
    HttpModule,
  ],
  controllers: [CoinsController,CoinsPublicController],
  providers: [CoinsService, IAPValidatorProvider],
  exports: [CoinsService],
})
export class CoinsModule {}
