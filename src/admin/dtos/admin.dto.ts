import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

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