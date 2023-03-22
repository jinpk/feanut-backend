import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFileDto, CreateFileResponseDto } from './dtos';
import { File, FileDocument } from './schemas/files.schema';
import { Storage } from '@google-cloud/storage';
import * as dayjs from 'dayjs';
import { GC_STORAGE_BUCKET } from './files.constant';
import { GOOGLE_CLOUD_PROJECT_ID } from 'src/common/common.constant';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private gcStorage = new Storage();

  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private configService: ConfigService,
  ) {
    this.gcStorage = new Storage({
      projectId: GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: this.configService.get('googleCloudClientEmail'),
        private_key: this.configService.get('googleCloudPrivateKey'),
      },
    });
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

    const file = `${this.configService.get('env')}/${key}`;

    const [signedUrl] = await this.gcStorage
      .bucket(GC_STORAGE_BUCKET)
      .file(file)
      .getSignedUrl({
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
