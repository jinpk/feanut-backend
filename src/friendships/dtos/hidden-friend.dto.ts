import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class HiddenFriendDto {
  @ApiProperty({ title: '친구 profile ID' })
  @IsString()
  @IsNotEmpty()
  friendProfileIdId: string;

  @ApiProperty({ title: '숨김여부' })
  @IsBoolean()
  @IsNotEmpty()
  hidden: boolean;
}
