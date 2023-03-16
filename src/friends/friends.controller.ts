import {
    Controller,
    Get,
    Param,
    Delete,
    Patch,
    Put,
    Post,
    Query,
    NotFoundException,
    UnauthorizedException,
    Body,
    Request,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiResponse,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators';

@ApiTags('Friend')
@Controller('friends')
export class FriendsController {}
