import {
  Controller,
  Post,
  Body,
  Request,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { WrappedError } from 'src/common/errors';
import { AddFriendDto, FriendDto, GetFriendsDto } from './dtos';
import { FRIENDSHIPS_MODULE_NAME } from './friendships.constant';
import { FriendShipsService } from './friendships.service';

@ApiTags('FriendShip')
@Controller(FRIENDSHIPS_MODULE_NAME)
@ApiBearerAuth()
export class FriendsController {
  constructor(private friendShipsService: FriendShipsService) {}

  @Get(':userId/friends/has')
  @ApiOperation({
    summary: '친구 1명 이상 있는지 여부',
  })
  @ApiOkResponse({
    type: Boolean,
    description: `false: 한번도 친구 추가한적 없음.`,
  })
  async getHasFriends(@Request() req, @Param('userId') userId: string) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    return await this.friendShipsService.hasFriends(userId);
  }

  @Get(':userId/friends')
  @ApiOperation({
    summary: '친구목록 조회',
    description: '숨김처리한 친구는 query.hidden = 1 로 불러올 수 있습니다.',
  })
  @ApiOkResponsePaginated(FriendDto)
  async getFriends(
    @Request() req,
    @Param('userId') userId: string,
    @Query() query: GetFriendsDto,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    const { total, data } =
      query.hidden === '1'
        ? await this.friendShipsService.listHiddenFriend(
            userId,
            query.page,
            query.limit,
          )
        : await this.friendShipsService.listFriend(
            userId,
            query.page,
            query.limit,
          );

    const dtoData: FriendDto[] = [];
    data.forEach((x, i) => {
      dtoData.push(this.friendShipsService._friendDocToDto(x));
    });

    return {
      total,
      data: dtoData,
    };
  }

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
