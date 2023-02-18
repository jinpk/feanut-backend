import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dtos';

export class LoginDto extends PickType(CreateUserDto, [
  'username',
  'password',
]) {}

export class TokenDto {
  @ApiProperty({ description: 'Access Token (30m)' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token (14d)' })
  refreshToken: string;
}
