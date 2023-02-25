import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWS_S3_UPLOAD_BUCKET } from '../common.constant';

@Injectable()
export class AWSS3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('awsRegion'),
      credentials: {
        accessKeyId: configService.get('awsAccessKeyId'),
        secretAccessKey: configService.get('awsSecretAccessKey'),
      },
    });
  }

  /**
   * @param {string} key key must startsWith 'uploads/' prefix
   */
  async genPreSignedUploadUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: AWS_S3_UPLOAD_BUCKET,
      Body: '',
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 3,
    });

    return signedUrl;
  }
}
