import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Friend')
@Controller('friends')
export class FriendsController {}
