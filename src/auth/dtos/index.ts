export * from './login.dto';
export * from './signup.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TokenDto {
  @ApiProperty({ title: 'Access Token (30m)' })
  accessToken: string;
}

export class AdminLoginDto {
  @ApiProperty({
    description: '로그인 username',
  })
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '로그인 비밀번호',
  })
  password: string;
}
