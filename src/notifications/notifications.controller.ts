import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationsController {}
