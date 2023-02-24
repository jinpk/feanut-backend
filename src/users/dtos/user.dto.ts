import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { Gender } from '../enums';

export class UserDto {
  @ApiProperty({ description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '성별', enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: '출생년도' })
  @IsNumber()
  @Min(1900)
  @Max(2030)
  birthYear: number;
}
