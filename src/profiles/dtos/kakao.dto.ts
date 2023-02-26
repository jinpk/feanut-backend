import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class InsertKakaoProfileDto {
  @IsNotEmpty()
  id: bigint;

  @IsOptional()
  @IsNotEmpty()
  uuid: string;

  @IsNotEmpty()
  nickname: string;

  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  profileThumbnailUrl: string;
}
