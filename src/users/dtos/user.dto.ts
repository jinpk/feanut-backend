import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'userId' })
  id: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: 'profileId' })
  profileId: string;
}