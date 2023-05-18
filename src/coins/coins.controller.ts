import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Body,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { CoinsService } from './conis.service';
import { CoinDto, PurchaseCoinDto } from './dtos/coin.dto';
import { GetBuyCoinDto } from './dtos/get-coin.dto';
import { BuyCoin } from './schemas/buycoin.schema';
import { WrappedError } from 'src/common/errors';
import { COIN_MODULE_NAME, COIN_ERROR_NOT_AN_ADMIN } from './coins.constant';
import { Public } from 'src/auth/decorators';
import { Response } from 'express';

@ApiTags('Coin')
@Controller('coins')
@ApiBearerAuth()
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get('me')
  @ApiOperation({
    summary: '사용자 feanut(coin) 조회',
  })
  @ApiOkResponse({
    type: CoinDto,
  })
  async getUsecoin(@Request() req) {
    return await this.coinsService.findUserCoin(req.user.id);
  }

  /*@Get('usecoins')
  @ApiOperation({
    summary: '(ADMIN) 사용자 사용내역 조회',
    description: 'userId 미입력 시 전체조회',
  })
  @ApiOkResponsePaginated(UseCoin)
  async getUsecoinList(@Query() query: GetUseCoinDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        COIN_MODULE_NAME,
        COIN_ERROR_NOT_AN_ADMIN,
        'Not an Admin');
    }
    return await this.coinsService.findListUsecoin(query);
  }*/

  @Get('buycoins')
  @ApiOperation({
    summary: '결제내역 조회',
    description: 'userId 미입력 시 조회X',
  })
  @ApiOkResponsePaginated(BuyCoin)
  async getBuycoinList(@Query() query: GetBuyCoinDto, @Request() req) {
    if (!req.user.isAdmin) {
      if (query.userId != req.user.id) {
        throw new WrappedError(
          COIN_MODULE_NAME,
          COIN_ERROR_NOT_AN_ADMIN,
          'Not an Admin',
        );
      } else {
        return await this.coinsService.findListBuycoin(query);
      }
    } else {
      return await this.coinsService.findListBuycoin(query);
    }
  }

  @Post('purchase')
  @ApiOperation({
    summary: '버터 구매 (iOS, Android IAP)',
  })
  @ApiResponse({
    status: 200,
    type: String,
  })
  async postBuyCoin(@Body() body: PurchaseCoinDto, @Request() req) {
    return await this.coinsService.createBuyCoin(req.user.id, body);
  }
}

@ApiTags('Coin')
@Controller('coins')
export class CoinsPublicController {
  constructor(private readonly coinsService: CoinsService) {}

  @Post('purchase/update/:provider')
  @Public()
  @ApiOperation({
    summary: '버터 인앱 결제 Update Listener',
  })
  async purchaseUpdate(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
    @Param('provider') provider: 'playstore' | 'appstore',
  ) {
    res.status(HttpStatus.OK);
    console.log(
      `Purchase Updated: ${JSON.stringify(body)}, provider: ${provider}`,
    );
    return;
  }
}
