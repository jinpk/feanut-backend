import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'userId' })
  id: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: 'profileId' })
  profileId: string;
}

export class FeanutCardDto {
  @ApiProperty({ default: 0})
  joy: number;

  @ApiProperty({ default: 0})
  gratitude: number;

  @ApiProperty({ default: 0})
  serenity: number;

  @ApiProperty({ default: 0})
  interest: number;

  @ApiProperty({ default: 0})
  hope: number;

  @ApiProperty({ default: 0})
  pride: number;

  @ApiProperty({ default: 0})
  amusement: number;

  @ApiProperty({ default: 0})
  inspiration: number;

  @ApiProperty({ default: 0})
  awe: number

  @ApiProperty({ default: 0})
  love: number;
}
