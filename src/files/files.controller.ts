import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFileDto, CreateFileResponseDto } from './dtos';
import { FilesService } from './files.service';

@Controller('files')
@ApiTags('File')
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('s3')
  @ApiOperation({
    summary: 'S3 파일 업로드',
    description: `return된 preSignedUrl로 파일 업로드 필수`,
  })
  @ApiOkResponse({ type: CreateFileResponseDto })
  async postFile(
    @Req() req,
    @Body() body: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    return await this.filesService.createFileWithPreSignedUrl(
      req.user.id,
      body,
    );
  }
}
