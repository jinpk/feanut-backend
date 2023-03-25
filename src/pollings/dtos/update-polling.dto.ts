import { PartialType, ApiProperty } from '@nestjs/swagger';
import { PollingDto } from './polling.dto';

export class UpdatePollingDto {
  @ApiProperty({})
  selectedProfileId: string;
}
