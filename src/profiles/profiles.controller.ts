import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UpdateProfileDto } from './dtos';

@Controller()
export class ProfilesController {
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
    @Body() body: UpdateProfileDto,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException();
    }

    //await this.usersService.patchUser(id, body);
  }
}
