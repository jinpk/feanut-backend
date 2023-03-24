import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users/existence')
export class UsersExistenceController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by/username/:username')
  @Public()
  @ApiOperation({
    summary: '사용자 조회 By Username',
  })
  @ApiResponse({ type: Boolean })
  async existence(@Param('username') username: string): Promise<Boolean> {
    return await this.usersService.hasUsername(username);
  }
}
