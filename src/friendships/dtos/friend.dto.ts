import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/profiles/enums';

export class FriendDto {
  @ApiProperty({ title: '친구 profileId' })
  profileId: string;

  @ApiProperty({ title: '친구 성별' })
  gender?: Gender;

  @ApiProperty({ title: '친구 이름' })
  name: string;

  @ApiProperty({ title: '친구 숨김 여부' })
  hidden?: string;

  @ApiProperty({ title: '친구 프로필 이미지' })
  profileImageKey?: string;
}
