import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ title: '이름', required: false })
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    title: '상태메시지',
    description: '최대 50자',
    required: false,
  })
  @IsOptional()
  @MaxLength(50)
  statusMessage: string;

  @ApiProperty({ title: '프로필 이미지 ID', required: false })
  @IsOptional()
  imageFileId: string;

  @ApiProperty({
    title: 'Clear instagram',
    description: 'only empty string to clear',
    required: false,
  })
  @IsOptional()
  @IsEmpty()
  instagram: string;
}
