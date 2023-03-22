import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { FeanutCardDto } from './dtos';

@ApiTags('Profile')
@Controller('profiles')
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get(':id/feanutcard')
  @ApiOperation({
    summary: '프로필 피넛 카드 조회',
  })
  async getMyFeanutCard(
    @Req() req,
    @Param('id') profileId: string,
  ): Promise<FeanutCardDto> {
    return await this.profileService.findMyFeanutCard(profileId);
  }
}
