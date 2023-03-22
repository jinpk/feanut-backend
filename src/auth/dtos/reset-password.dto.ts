import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class ResetPasswordVerificationDto {
  @ApiProperty({ title: 'feanutID', description: '가입된 feanutID' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    title: 'feanutID와 맵핑된 휴대폰번호',
    description: '-없이 숫자만 11자리',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(11)
  phoneNumber: string;
}

export class ResetPasswordDto {
  @ApiProperty({ title: 'authId' })
  @IsNotEmpty()
  authId: string;

  @ApiProperty({ title: '인증코드', description: '6자리' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(6)
  code: string;

  @ApiProperty({ title: '변경할 비밀번호' })
  @IsNotEmpty()
  password: string;
}
