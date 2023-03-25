import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enums';

export class ProfileDto {
  @ApiProperty({ description: 'profile ID' })
  id: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '성별', enum: Gender })
  gender: Gender;

  @ApiProperty({ description: '생년월일' })
  birth: string;

  @ApiProperty({ title: '상태메시지' })
  statusMessage: string;

  @ApiProperty({ title: 'profile Image Key' })
  profileImageKey: string;

  @ApiProperty({ title: '인스타그램 username' })
  instagram: string;

  @ApiProperty({ title: 'ownerUserId' })
  ownerId: string;
}
