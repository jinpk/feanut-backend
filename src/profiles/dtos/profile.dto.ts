import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enums';

export class ProfileDto {
  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '성별', enum: Gender })
  gender: Gender;

  @ApiProperty({ description: '생년월일' })
  birth: string;

  @ApiProperty({ title: '상태메시지' })
  statusMessage: string;
}
