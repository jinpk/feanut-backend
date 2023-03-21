import {
    Controller,
    Get,
    NotFoundException,
    Req,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiResponse,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { FeanutCardDto } from './dtos';
import { UsersService } from 'src/users/users.service';

@ApiTags('Profile')
@Controller('profiles')
@ApiBearerAuth()
export class ProfilesController {
    constructor(
        private readonly profileService: ProfilesService,
        private readonly usersService: UsersService,
    ) {}

    @Get('feanutcard')
    @ApiOperation({
      summary: '나의 피넛 카드 조회',
    })
    async getMyFeanutCard(@Req() req): Promise<FeanutCardDto> {
      console.log(req);
      const user = await this.usersService.findActiveUserById(req.user.id);
      if (!user) {
        throw new NotFoundException('');
      }
  
      return await this.profileService.findMyFeanutCard(user.profileId);
    }
}
