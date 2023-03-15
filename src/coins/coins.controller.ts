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
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { CoinsService } from './conis.service';
import { CoinDto } from './dtos/coin.dto';
import { UpdateCoinDto } from './dtos/update-coin.dto';
import { GetBuyCoinDto } from './dtos/get-buycoin.dto';
import { BuyCoin } from './schemas/buycoin.schema';

@ApiTags('Coin')
@Controller('coins')
@ApiBearerAuth()
export class CoinsController {
    constructor(private readonly coinsService: CoinsService) {}

    @Post()
    @ApiOperation({
        summary: '(ADMIN) 사용자 결제내역 조회',
    })
    @ApiOkResponse({
        status: 200,
    })
    async create(@Body() CoinDto: CoinDto) {
    //   return this.coinsService.create(CoinDto);
    }
  
    @Get('')
    @ApiOperation({
        summary: '(ADMIN) 사용자 결제내역 조회',
    })
    @ApiBody({
        type: GetBuyCoinDto,
    })
    @ApiOkResponsePaginated(BuyCoin)
    async findAll() {
    //   return this.coinsService.findAll();
    }
  
    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //   return this.pollsService.findOne();
    // }
  
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePollDto: UpdateCoinDto) {
    //   return this.coinsService.update(+id, updatePollDto);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
    //   return this.coinsService.remove(+id);
    }
}
