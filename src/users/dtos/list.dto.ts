import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PagingReqDto } from 'src/common/dtos';
import { Gender } from 'src/profiles/enums';

export class GetRecommendationDto extends PagingReqDto {
  @ApiProperty({ description: '', required: false })
  keyword?: string;

  @ApiProperty({ description: '학교코드', required: false })
  schoolCode?: string;

  @ApiProperty({
    description: '휴대폰번호 , arr',
    required: false,
    type: String,
  })
  @Transform(({ value, type }) => {
    if (typeof value === 'string') {
      return value?.split(',');
    }
    return value;
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString({ each: true })
  phoneNumber?: string[];
}

class RecommendationSchoolDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  grade: string;
}

export class RecommendationDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  profileId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  profileImageKey: string;
  @ApiProperty()
  gender: Gender;
  @ApiProperty({ description: 'phoneNumber 요청만 응답' })
  phoneNumber?: string;
  @ApiProperty({ description: '학교정보' })
  school?: RecommendationSchoolDto;
  @ApiProperty({})
  isFriend?: boolean;
}
