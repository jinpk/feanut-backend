import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { ProfileDto, UpdateProfileDto } from './dtos';
import { WrappedError } from 'src/common/errors';
import { PROFILE_MODULE_NAME } from './profiles.constant';

@ApiTags('Profile')
@Controller('profiles')
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get('me')
  @ApiOperation({
    summary: '로그인 계정의 프로필 조회',
  })
  @ApiOkResponse({ type: ProfileDto })
  async getMyProfile(@Req() req) {
    const profile = await this.profileService.getByUserId(req.user.id);
    if (!profile) {
      throw new WrappedError(PROFILE_MODULE_NAME).notFound();
    }

    const dto = this.profileService.docToDto(profile);

    if (profile.imageFileId) {
      dto.profileImageKey = await this.profileService.getProfileImageKey(
        profile.imageFileId,
      );
    }

    return dto;
  }

  @Get(':profileId')
  @ApiOperation({
    summary: '프로필 조회',
  })
  @ApiOkResponse({ type: ProfileDto })
  async getProfile(@Req() req, @Param('profileId') profileId: string) {
    const profile = await this.profileService.getById(profileId);
    if (!profile) {
      throw new WrappedError(PROFILE_MODULE_NAME).notFound();
    }

    const dto = this.profileService.docToDto(profile);

    if (profile.imageFileId) {
      dto.profileImageKey = await this.profileService.getProfileImageKey(
        profile.imageFileId,
      );
    }

    return dto;
  }

  @Patch(':profileId')
  @ApiOperation({
    summary: '프로필 정보 수정',
    description: `수정원하는 컬럼만 요청`,
  })
  async patchProfile(
    @Req() req,
    @Param('profileId') profileId: string,
    @Body() body: UpdateProfileDto,
  ) {
    const profile = await this.profileService.getById(profileId);
    if (!profile) {
      throw new WrappedError(PROFILE_MODULE_NAME).notFound();
    } else if (!profile.ownerId || !profile.ownerId.equals(req.user.id)) {
      throw new WrappedError(PROFILE_MODULE_NAME).reject();
    }

    await this.profileService.updateById(profileId, body);
  }
}
