import { PartialType, ApiProperty } from '@nestjs/swagger';
import { PollDto } from './poll.dto';
import { RoundDto } from './round.dto';

export class UpdatePollDto extends PartialType(PollDto) {}

export class UpdateRoundDto extends PartialType(RoundDto) {}

export class UpdatePollIdsDto extends PartialType(RoundDto) {
    @ApiProperty({})
    pollIds: string[];

    @ApiProperty({})
    delete: boolean;
}
