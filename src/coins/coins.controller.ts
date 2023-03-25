import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Put,
  Post,
  Query,
  NotFoundException,
  UnauthorizedException,
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
import { CoinDto, BuyCoinDto, UseCoinDto } from './dtos/coin.dto';
import { UpdateCoinDto } from './dtos/update-coin.dto';
import { GetBuyCoinDto, GetUseCoinDto } from './dtos/get-coin.dto';
import { Coin } from './schemas/coin.schema';
import { BuyCoin } from './schemas/buycoin.schema';
import { UseCoin } from './schemas/usecoin.schema';

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

    @Get('usecoins')
    @ApiOperation({
        summary: '(ADMIN) 사용자 사용내역 조회',
        description: 'userId 미입력 시 전체조회',
    })
    @ApiOkResponsePaginated(UseCoin)
    async getUsecoinList(
        @Query() query: GetUseCoinDto,
        @Request() req) {
            if (!req.user.isAdmin) {
                throw new UnauthorizedException('Not an Admin')
            }
            return await this.coinsService.findListUsecoin(query);
    }
  
    @Get('buycoins')
    @ApiOperation({
        summary: '결제내역 조회',
        description: 'userId 미입력 시 조회X',
    })
    @ApiOkResponsePaginated(BuyCoin)
    async getBuycoinList(
        @Query() query: GetBuyCoinDto,
        @Request() req) {
            if (req.user.id == query.userId) {
                return await this.coinsService.findListBuycoin(query);
            }
    }

    @Post('buycoins')
    @ApiOperation({
        summary: '인앱 결제',
        description: 'token, productId 필수',
    })
    @ApiResponse({
        status: 200,
        type: String,
    })
    async postBuyCoin(@Body() body: BuyCoinDto, @Request() req) {
        return await this.coinsService.createBuyCoin(req.user.id, body);
    }

    @Put(':coinId')
    @ApiBody({
        type: UpdateCoinDto
    })
    @ApiResponse({
        status: 200,
        type: String,
    })
    async patchCoin(@Param('coinId') coinId: string, @Body() body, @Request() req){
        const coin = await this.coinsService.getCoinById(coinId, req.user.id);
        if (!coin) {
            throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
        }

        return await this.coinsService.updateCoin(coinId, req.user.id, body);
    }
}
