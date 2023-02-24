import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
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
  @ApiOkResponse({ description: 'Patch Successed.' })
  async patchUser(
    @Req() req,
    @Param('id') id: string,
    @Body() body: PatchUserDto,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException();
    }

    await this.usersService.patchUser(id, body);
  }
}
