import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Put,
  Post,
  Query,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { CoinsService } from './conis.service';
import { CoinDto, PurchaseCoinDto } from './dtos/coin.dto';
import { UpdateCoinDto } from './dtos/update-coin.dto';
import { GetBuyCoinDto, GetUseCoinDto } from './dtos/get-coin.dto';
import { BuyCoin } from './schemas/buycoin.schema';
import { UseCoin } from './schemas/usecoin.schema';
import { WrappedError } from 'src/common/errors';
import {
  COIN_MODULE_NAME,
  COIN_ERROR_NOT_AN_ADMIN,

} from './coins.constant';

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
          'Not an Admin');
      } else {
        return await this.coinsService.findListBuycoin(query);
      }
    } else {
      return await this.coinsService.findListBuycoin(query);
    }
  }

  @Post('purchase')
  @ApiOperation({
    summary: '피넛코인 구매 (iOS, Android IAP)',
  })
  @ApiResponse({
    status: 200,
    type: String,
  })
  async postBuyCoin(@Body() body: PurchaseCoinDto, @Request() req) {
    return await this.coinsService.createBuyCoin(req.user.id, body);
  }
}
