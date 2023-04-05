import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { Gender } from 'src/profiles/enums';

export class SignUpVerificationDto {
  @ApiProperty({ title: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ title: '성별', enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ title: '휴대폰번호', description: '-없이 숫자만 11자리' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(11)
  phoneNumber: string;
}

export class SignUpDto {
  @ApiProperty({ title: 'authId' })
  @IsNotEmpty()
  authId: string;

  @ApiProperty({ title: '인증코드', description: '6자리' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(6)
  code: string;
}
