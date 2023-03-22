import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  Length,
} from 'class-validator';
import { Gender } from '../enums';

export class ProfileDto {
  @ApiProperty({ description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '성별', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @ApiProperty({ description: '생년월일' })
  @IsOptional()
  @IsNumberString()
  @Length(8)
  birth: string;
}
