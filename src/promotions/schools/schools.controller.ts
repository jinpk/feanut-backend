import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Promotion Schools')
@Controller('promotions/schools')
export class PromotionSchoolsController {}
