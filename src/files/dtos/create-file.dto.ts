import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FilePurpose, SupportContentType } from '../enums';

export class CreateFileDto {
  @ApiProperty({ title: 'file usage purpose', enum: FilePurpose })
  @IsNotEmpty()
  @IsEnum(FilePurpose)
  purpose: FilePurpose;

  @ApiProperty({ title: 'object contentType', enum: SupportContentType })
  @IsNotEmpty()
  @IsEnum(SupportContentType)
  contentType: string;
}

export class CreateFileResponseDto {
  @ApiProperty({ title: 'Google Cloud Storage signed-url for upload' })
  signedUrl: string;

  @ApiProperty({ title: 'fileId' })
  fileId: string;
}
