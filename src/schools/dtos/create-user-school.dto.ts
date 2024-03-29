import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min, IsString, IsNumber } from 'class-validator';

export class CreateUserSchoolDto {
  @ApiProperty({ title: '반' })
  @IsNumber()
  @IsNotEmpty()
  room?: number;

  @ApiProperty({ title: '학년' })
  @IsNotEmpty()
  @Min(1)
  grade?: number;

  @ApiProperty({ title: '학교코드' })
  @IsNotEmpty()
  code: string;
}
