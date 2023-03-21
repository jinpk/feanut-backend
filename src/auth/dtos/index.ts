import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ title: '인증번호' })
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({ title: 'Code validation authId' })
  @IsNotEmpty()
  authId: string;
}

export class KakaoLoginDto {
  @ApiProperty({
    title: 'Kakao Access Token',
    description: 'frontend에서 accessToken까지 발급',
  })
  @IsNotEmpty()
  accessToken: string;
}

export class EmailLoginDto {
  @ApiProperty({ title: '이메일' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class AuthDto {
  @ApiProperty({ title: 'Code validation authId (3m)' })
  authId: string;
}

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
