import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Vote')
@Controller('votes')
export class VotesController {}
