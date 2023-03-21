import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'feanutId',
  })
  @IsNotEmpty()
  feanutId: string;
}

export class LoginDto {
  @ApiProperty({ title: 'feanutId' })
  @IsNotEmpty()
  feanutId: string;

  @ApiProperty({ title: 'password' })
  @IsNotEmpty()
  password: string;
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
