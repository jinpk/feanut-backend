import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Coin')
@Controller('coins')
export class CoinsController {}
