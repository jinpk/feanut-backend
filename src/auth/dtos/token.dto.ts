import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ title: 'Refresh Token (2w)' })
  refreshToken: string;
}

export class TokenDto extends RefreshTokenDto {
  @ApiProperty({ title: 'Access Token (30m)' })
  accessToken: string;
}
