import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'userId' })
  id?: string;

  @ApiProperty({ description: 'feanutId' })
  feanutId: string;

  @ApiProperty({ description: 'profileId' })
  profileId?: string;
}