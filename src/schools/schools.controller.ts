import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('School')
@Controller('schools')
export class SchoolsController {}
