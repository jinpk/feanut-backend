import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dtos';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: '로그인 정보 조회',
  })
  async getMe(@Req() req): Promise<UserDto> {
    const user = await this.usersService.findActiveUserById(req.user.id);
    if (!user) {
      throw new NotFoundException('');
    }
    return await this.usersService._userDocToDto(user);
  }
}
