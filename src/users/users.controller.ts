import { Body, Controller, Patch, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PatchUserDto } from './dtos';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH User',
    description: '수정하고싶은 field만 담아서 요청',
  })
  @ApiParam({ name: 'id', description: 'userId' })
  async patchUser(
    @Req() req,
    @Query('id') id: string,
    @Body() body: PatchUserDto,
  ) {}
}
