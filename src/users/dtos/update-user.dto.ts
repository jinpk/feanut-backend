import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { Gender } from '../enums';

export class PatchUserDto {
  @ApiProperty({ title: '이름', required: false })
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    title: 'fileId',
    description: 'enable empty string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  profileImageId: string;

  @ApiProperty({
    title: '생일',
    description: 'format: YYYYMMDD',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @Length(8, 8)
  birth: string;

  @ApiProperty({ title: '성별', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
}
