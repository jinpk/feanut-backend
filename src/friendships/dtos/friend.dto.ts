import { ApiProperty } from '@nestjs/swagger';

export class FriendDto {
  @ApiProperty({ title: '친구 profileId' })
  profileId: string;

  @ApiProperty({ title: '친구 이름' })
  name: string;
}
