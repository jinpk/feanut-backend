import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserSchoolDto,
  ListSchoolDto,
  SchoolDto,
  UserSchoolDto,
} from './dtos';
import { WrappedError } from 'src/common/errors';
import {
  SCHOOL_ERROR_NOT_FOUND_MY_SCHOOL,
  SCHOOL_MODULE_NAME,
} from './schools.constants';
import { SchoolsService } from './schools.service';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { Public } from 'src/auth/decorators';

@Controller('schools')
@ApiTags('School')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post('users')
  @ApiOperation({
    summary: '내 학교 등록',
  })
  @ApiBearerAuth()
  async insertMySchool(@Req() req, @Body() body: CreateUserSchoolDto) {
    await this.schoolsService.insertUserSchool(
      req.user.id,
      body.code,
      body.grade,
      body.room,
    );
  }

  @Get('users/me')
  @ApiOperation({
    summary: '내 학교 조회',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserSchoolDto })
  async getMySchool(@Req() req) {
    const school = await this.schoolsService.getUserSchool(req.user.id);
    if (!school) {
      throw new WrappedError(
        SCHOOL_MODULE_NAME,
        SCHOOL_ERROR_NOT_FOUND_MY_SCHOOL,
      ).notFound();
    }

    return school;
  }

  @Get('')
  @ApiOperation({
    summary: '학교 리스트 조회',
    description: 'keyword 필수 조회',
  })
  @Public()
  @ApiOkResponsePaginated(SchoolDto)
  async listSchool(@Query() query: ListSchoolDto) {
    return await this.schoolsService.listSchool(query);
  }

  // @Get('test')
  // @ApiOperation({
  //   summary: '',
  // })
  // @Public()
  // @ApiOkResponsePaginated(SchoolDto)
  // async test(@Query() query: ListSchoolDto) {
  //   return await this.schoolsService.getSchoolFriendList('64356704fc3a2a34dc64a6c8');
  // }
}
