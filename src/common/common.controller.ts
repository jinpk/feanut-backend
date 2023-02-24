import { Controller, Get } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Common')
@ApiBasicAuth()
export class CommonController {
  @Get('files/presignedurl')
  @ApiOperation({ summary: 'S3 파일 업로드 URL 생성' })
  async getPreSignedUrl() {}
}
