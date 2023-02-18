import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('')
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ description: 'createdUserId', type: String })
  async createUser(@Body() body: CreateUserDto) {
    const existUser = await this.usersService.findActiveUserOne({
      username: body.username,
    });
    if (existUser) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }
    return this.usersService.createUser(body);
  }
}
