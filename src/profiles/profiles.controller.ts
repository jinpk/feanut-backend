import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profiles')
export class ProfilesController {}
