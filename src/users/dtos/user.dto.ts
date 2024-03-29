import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'userId' })
  id: string;

  @ApiProperty({ description: 'phoneNumber' })
  phoneNumber: string;
}
