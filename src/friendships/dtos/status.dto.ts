import { ApiProperty } from '@nestjs/swagger';

export class FriendshipStatusDto {
  @ApiProperty({ title: '친구수', description: '숨김 친구는 포함하지 않음' })
  friendsCount: number;
}
