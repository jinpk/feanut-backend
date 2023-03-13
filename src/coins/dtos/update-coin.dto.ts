import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class UpdateCoinDto {
  @ApiProperty({ title: '이름', required: false })
  @IsOptional()
  @IsNotEmpty()
  name: string;
}
