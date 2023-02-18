import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscription')
@Controller('subscriptions')
export class SubscriptionsController {}
