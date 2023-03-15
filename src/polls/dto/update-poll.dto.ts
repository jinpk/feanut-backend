import { PartialType } from '@nestjs/swagger';
import { PollDto } from './poll.dto';

export class UpdatePollDto extends PartialType(PollDto) {}
