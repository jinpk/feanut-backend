import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFileDto, CreateFileResponseDto } from './dtos';
import { File, FileDocument } from './schemas/files.schema';
import { Bucket, Storage } from '@google-cloud/storage';
import * as dayjs from 'dayjs';
import { GOOGLE_CLOUD_PROJECT_ID } from 'src/common/common.constant';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private readonly bucket: Bucket;

  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private configService: ConfigService,
  ) {
    const storage = new Storage({
      projectId: GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: this.configService.get('googleCloudClientEmail'),
        private_key: this.configService.get('googleCloudPrivateKey'),
      },
    });
    this.bucket = storage.bucket(this.configService.get('googleCloudBucket'));
  }

  async getKeyById(fileId: string | Types.ObjectId): Promise<string | null> {
    return (await this.fileModel.findById(fileId))?.key || null;
  }

  async hasById(fileId: string) {
    if (await this.fileModel.findById(fileId)) {
      return true;
    }

    return false;
  }

  async updateUploadedState(fileId: string) {
    await this.fileModel.findByIdAndUpdate(fileId, {
      $set: { isUploaded: true },
    });
  }

  async createFileWithSignedUrl(
    userId: string | Types.ObjectId,
    dto: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    const key = `${userId}-${dto.purpose}-${Date.now()}.${dto.contentType
      .split('/')
      .pop()}`;

    const doc = new this.fileModel({
      ownerId: userId,
      purpose: dto.purpose,
      contentType: dto.contentType,
      key,
    });

    const [signedUrl] = await this.bucket.file(key).getSignedUrl({
      version: 'v4',
      action: 'write',
      contentType: dto.contentType,
      expires: dayjs().add(3, 'minutes').toDate(), // 3min
    });

    await doc.save();

    return {
      fileId: doc._id.toHexString(),
      signedUrl,
    };
  }
}
