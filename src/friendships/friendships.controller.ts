import {
  Controller,
  Post,
  Body,
  Request,
  Param,
  Get,
  Query,
  Patch,
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
import { ProfilesService } from 'src/profiles/profiles.service';
import {
  AddFriendByUserDto,
  AddFriendDto,
  AddFriendManyDto,
  FriendDto,
  FriendshipStatsDto,
  GetFriendsDto,
  HiddenFriendDto,
} from './dtos';
import {
  FRIENDSHIPS_MODULE_NAME,
  FRIENDS_ERROR_NON_EXIST_FRIEND,
  FRIENDS_ERROR_NO_LEGACY,
} from './friendships.constant';
import { FriendshipsService } from './friendships.service';

@ApiTags('Friendship')
@Controller(FRIENDSHIPS_MODULE_NAME)
@ApiBearerAuth()
export class FriendshipsController {
  constructor(
    private friendshipsService: FriendshipsService,
    private profilesService: ProfilesService,
  ) {}

  @Get(':profileId/stats/byprofile')
  @ApiOperation({
    summary: 'Friendship 조회 by profileId',
  })
  @ApiOkResponse({ type: FriendshipStatsDto })
  async friendShipStatusByProfileId(
    @Param('profileId') profileId: string,
  ): Promise<FriendshipStatsDto> {
    const userId = await this.profilesService.getOwnerIdById(profileId);

    return {
      friendsCount: await this.friendshipsService.getFriendsCount(userId),
    };
  }

  @Get(':userId/stats')
  @ApiOperation({
    summary: 'Friendship 조회',
  })
  @ApiOkResponse({ type: FriendshipStatsDto })
  async friendShipStatus(
    @Request() req,
    @Param('userId') userId: string,
  ): Promise<FriendshipStatsDto> {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    return {
      friendsCount: await this.friendshipsService.getFriendsCount(userId),
    };
  }

  @Patch(':userId/friends/hidden')
  @ApiOperation({
    summary: '친구 숨김',
  })
  async hiddenFrind(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: HiddenFriendDto,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    const isSucceed = body.hidden
      ? await this.friendshipsService.hideFriend(userId, body.friendProfileIdId)
      : await this.friendshipsService.unHideFriend(
          userId,
          body.friendProfileIdId,
        );

    if (!isSucceed) {
      throw new WrappedError(
        FRIENDSHIPS_MODULE_NAME,
        FRIENDS_ERROR_NON_EXIST_FRIEND,
      ).notFound();
    }
  }

  @Get(':userId/friends/:profileId/byprofile')
  @ApiOperation({
    summary: '친구관계 조회 by profileId',
  })
  @ApiOkResponse({ type: FriendDto })
  async getFriendByProfileId(
    @Request() req,
    @Param('userId') userId: string,
    @Param('profileId') profileId: string,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    const friend = await this.friendshipsService.getFriendByProfileId(
      userId,
      profileId,
    );

    if (!friend) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).notFound();
    }

    return friend;
  }

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

    return await this.friendshipsService.hasFriends(userId);
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

    return await this.friendshipsService.listFriend(userId, {
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      hidden: query.hidden === '1',
    });
  }

  @Post(':userId/friends/many')
  @ApiOperation({ summary: '연락처 동기화', description: `` })
  @ApiCreatedResponse({ description: '동기화 완료' })
  async addFriendsMany(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: AddFriendManyDto,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }
    await this.friendshipsService.addFriendManyWithCheck(userId, body);
  }

  @Post(':userId/friends/byuser')
  @ApiOperation({ summary: 'userId로 친구등록', description: `` })
  @ApiCreatedResponse({ description: '친구등록 완료' })
  async addFriendByProfile(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: AddFriendByUserDto,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }
    await this.friendshipsService.addFriendByUserId(userId, body.userId);
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
    await this.friendshipsService.addFriendWithCheck(userId, body);
  }

  @Post(':userId/legacy/clear')
  @ApiOperation({
    summary: '친구목록 초기화',
    description: 'isLegacy true인 경우 가능',
  })
  @ApiOkResponse({ type: Boolean })
  async clearFriendsForLegacy(@Request() req, @Param('userId') userId: string) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    const legacy = await this.friendshipsService.isLegacyFriendShipByUserId(
      userId,
    );

    if (!legacy) {
      throw new WrappedError(
        FRIENDSHIPS_MODULE_NAME,
        FRIENDS_ERROR_NO_LEGACY,
      ).reject();
    }

    return await this.friendshipsService.clearFriendsForLegacy(userId);
  }

  @Get(':userId/legacy')
  @ApiOperation({
    summary: '친구목록 Legacy 조회',
    description: 'true인 경우 친구 목록 초기화 필요.\n친구 추가 방법 변경',
  })
  @ApiOkResponse({ type: Boolean })
  async getLegacy(@Request() req, @Param('userId') userId: string) {
    if (req.user.id !== userId) {
      throw new WrappedError(FRIENDSHIPS_MODULE_NAME).reject();
    }

    return await this.friendshipsService.isLegacyFriendShipByUserId(userId);
  }
}
