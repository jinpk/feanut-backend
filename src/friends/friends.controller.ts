import { Controller, Post, Body, Request, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AddFriendDto } from './dtos';
import { FRIENDS_MODULE_NAME } from './friends.constant';
import { FriendsService } from './friends.service';

@ApiTags('Friend')
@Controller(FRIENDS_MODULE_NAME)
@ApiBearerAuth()
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('')
  @ApiOperation({ summary: '친구추가', description: `` })
  @ApiCreatedResponse({ description: '친구등록 완료' })
  async addFriend(@Request() req, @Body() body: AddFriendDto) {
    await this.friendsService.addFriendWithCheck(req.user.id, body);
  }
}
