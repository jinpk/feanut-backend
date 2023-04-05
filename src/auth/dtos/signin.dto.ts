import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class SignInVerificationDto {
  @ApiProperty({ title: '휴대폰번호', description: '-없이 숫자만 11자리' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(11)
  phoneNumber: string;
}

export class SignInDto {
  @ApiProperty({ title: 'authId' })
  @IsNotEmpty()
  authId: string;

  @ApiProperty({ title: '인증코드', description: '6자리' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(6)
  code: string;
}
