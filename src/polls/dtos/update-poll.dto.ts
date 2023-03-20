import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { PollDto } from './poll.dto';
import { RoundDto } from './round.dto';

export class UpdatePollDto extends PartialType(PollDto) {}

export class UpdateRoundDto extends PartialType(RoundDto) {}

export class UpdatePollIdsDto extends OmitType(RoundDto,[
    'startedAt',
    'endedAt',
    'enabled',
] as const) {
    @ApiProperty({})
    delete: boolean;
}
