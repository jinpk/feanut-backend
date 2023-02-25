import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { ListSchoolDto, SchoolJoinedDto } from './dtos';

@Controller('schools')
@ApiTags('School')
@ApiBearerAuth()
export class SchoolsController {
  @Get('')
  @ApiOperation({
    summary: 'Lookup Schools',
  })
  @ApiOkResponsePaginated(SchoolJoinedDto)
  async listSchool(@Query() query: ListSchoolDto) {
    return [];
  }
}
