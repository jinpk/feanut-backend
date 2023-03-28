import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PagingReqDto } from 'src/common/dtos';
import { QueryBoolean } from 'src/common/enums';

export class GetFriendsDto extends PagingReqDto {
  @ApiProperty({ title: '숨김친구 조회', required: false })
  @IsOptional()
  @IsEnum(QueryBoolean)
  hidden?: QueryBoolean;

  @ApiProperty({ title: '이름 | 아이디', required: false })
  @IsOptional()
  keyword?: string;
}
