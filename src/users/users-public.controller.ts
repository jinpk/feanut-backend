import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Public } from 'src/auth/decorators';

@ApiTags('User')
@Controller('users')
export class UsersPublicController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':phoneNumber/referral/length/byphone')
  @Public()
  @ApiOperation({
    summary: '휴대폰번호로 내가 초대한 친구 수 조회',
    description: '탈퇴하지 않은 현재 해당 번호를 소유한 유저 기준으로 조회',
  })
  @ApiResponse({ type: Number, description: '가입자 수' })
  async getReferralLengthByPhone(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<number> {
    return await this.usersService.getReferralLengthByPhone(phoneNumber);
  }
}
