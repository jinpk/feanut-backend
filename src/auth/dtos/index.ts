import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ title: '인증번호' })
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({ title: 'Code validation authId' })
  @IsNotEmpty()
  authId: string;
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
