import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { AWSS3Service } from './providers/aws-s3.provider';

@Module({
  controllers: [CommonController],
  providers: [AWSS3Service],
})
export class CommonModule {}
