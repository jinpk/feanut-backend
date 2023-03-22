import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'userId' })
  id?: string;

  @ApiProperty({ description: 'username (feanutID)' })
  username: string;

  @ApiProperty({ description: 'hasPassword' })
  hasPassword: boolean;
}
