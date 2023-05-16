import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTryOpenLogDto {
  @ApiProperty()
  @IsNotEmpty()
  pollingId: string;
}