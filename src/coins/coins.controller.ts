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
} from '@nestjs/swagger'
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
        type: Coin
    })
    async getUsecoin(@Request() req) {
        console.log(req.isAdmin)
      return await this.coinsService.findUserCoin(req.user.id);
    }

    @Get('usecoins/list')
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
  
    @Get('buycoins/list')
    @ApiOperation({
        summary: '(ADMIN) 결제내역 조회',
        description: 'userId 미입력 시 전체조회',
    })
    @ApiOkResponsePaginated(BuyCoin)
    async getBuycoinList(@Query() query: GetBuyCoinDto) {
      return await this.coinsService.findListBuycoin(query);
    }

    @Post('buycoin')
    @ApiBody({
        type: BuyCoinDto,
    })
    @ApiResponse({
        status: 200,
        type: String,
    })
    async postBuyCoin(@Query() body, @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
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
            throw new NotFoundException('');
        }

        return await this.coinsService.updateCoin(coinId, req.user.id, body);
    }
}
