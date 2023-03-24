import { Controller, Post, Body, Request, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { WrappedError } from 'src/common/errors';
import { AddFriendDto } from './dtos';
import { FRIENDSHIPS_MODULE_NAME } from './friendships.constant';
import { FriendShipsService } from './friendships.service';

@ApiTags('FriendShip')
@Controller(FRIENDSHIPS_MODULE_NAME)
@ApiBearerAuth()
export class FriendsController {
  constructor(private friendShipsService: FriendShipsService) {}

  @Post(':userId/friends')
  @ApiOperation({ summary: '전화번호로 친구등록', description: `` })
  @ApiCreatedResponse({ description: '친구등록 완료' })
  async addFriend(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: AddFriendDto,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }
    await this.friendShipsService.addFriendWithCheck(userId, body);
  }
}
