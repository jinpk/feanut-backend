import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WrappedError } from 'src/common/errors';
import { UserDto } from './dtos';
import { USER_MODULE_NAME } from './users.constant';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Delete('me')
  @ApiOperation({
    summary: '계정 탈퇴',
  })
  @ApiResponse({ type: UserDto })
  @ApiQuery({
    name: 'reason',
    type: String,
    description: '탈퇴 사유',
    required: true,
  })
  async deleteMe(@Req() req, @Query('reason') reason: string) {
    if (!reason) {
      throw new WrappedError(
        USER_MODULE_NAME,
        null,
        'reason is empty string.',
      ).badRequest();
    }

    const user = await this.usersService.findActiveUserById(req.user.id);
    if (!user) {
      throw new WrappedError(
        USER_MODULE_NAME,
        null,
        'non exist active user.',
      ).notFound();
    }

    await this.usersService.deleteUser(user._id, reason);
  }

  @Get('me')
  @ApiOperation({
    summary: '로그인 정보 조회',
  })
  @ApiResponse({ type: UserDto })
  async getMe(@Req() req): Promise<UserDto> {
    const user = await this.usersService.findActiveUserById(req.user.id);
    if (!user) {
      throw new NotFoundException('');
    }
    return await this.usersService._userDocToDto(user);
  }
}
