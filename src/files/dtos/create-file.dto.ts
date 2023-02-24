import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMimeType, IsNotEmpty } from 'class-validator';
import { FileType } from '../enums';

export class CreateFileDto {
  @ApiProperty({ title: 'object mimetype' })
  @IsNotEmpty()
  @IsMimeType()
  mimetype: string;

  @ApiProperty({ title: 'file usage type', enum: FileType })
  @IsNotEmpty()
  @IsEnum(FileType)
  type: FileType;
}

export class CreateFileResponseDto {
  @ApiProperty({ title: 'S3 PreSigned Upload Url' })
  preSignedUrl: string;

  @ApiProperty({ title: 'fileId' })
  fileId: string;
}
