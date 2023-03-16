import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profiles')
export class ProfilesController {}
