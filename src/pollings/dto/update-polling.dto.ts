import { PartialType } from '@nestjs/swagger';
import { CreatePollingDto } from './create-polling.dto';

export class UpdatePollingDto extends PartialType(CreatePollingDto) {}
