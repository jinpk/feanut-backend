import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class EmailLoginDto {
  @ApiProperty({ title: '이메일' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class PhoneNumberLoginDto {
  @ApiProperty({ title: '휴대폰번호' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}

export class AuthDto {
  @ApiProperty({ title: 'Code validation authId (3m)' })
  authId: string;
}

export class TokenDto {
  @ApiProperty({ title: 'Access Token (30m)' })
  accessToken: string;
}
