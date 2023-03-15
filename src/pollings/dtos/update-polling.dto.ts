import { PartialType } from '@nestjs/swagger';
import { PollingDto } from './polling.dto';

export class UpdatePollingDto extends PartialType(PollingDto) {}
