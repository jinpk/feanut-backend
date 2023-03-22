import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFileDto, CreateFileResponseDto } from './dtos';
import { FILE_MODULE_NAME } from './files.constant';
import { FilesService } from './files.service';

@Controller(FILE_MODULE_NAME)
@ApiTags('File')
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('')
  @ApiOperation({
    summary: '파일 업로드',
    description: `1. client에서 업로드할 원본 파일의 파일 목적과 Object ContentType 포함하여 API를 호출합니다.
    \n2. GOOGLE CLOUD에 바로 업도르 가능한 3분 제한 signedURL을 응답합니다.
    \n3. signedURL로 객체를 바로 업로드하고 fileId를 다른 로직에 저장합니다.`,
  })
  @ApiOkResponse({ type: CreateFileResponseDto })
  async uploadFile(@Req() req, @Body() body: CreateFileDto) {
    return await this.filesService.createFileWithSignedUrl(req.user.id, body);
  }
}
