import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AWSS3Service } from 'src/common/providers';
import { CreateFileDto, CreateFileResponseDto } from './dtos';
import { File, FileDocument } from './schemas/files.schema';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private awsS3Service: AWSS3Service,
  ) {}

  async createFileWithPreSignedUrl(
    userId: string,
    dto: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    let objectKey: string;

    const preSignedUrl = await this.awsS3Service.genPreSignedUploadUrl(
      objectKey,
    );

    const fileDoc = await new this.fileModel({
      userId: new Types.ObjectId(userId),
      mimetype: dto.mimetype,
      type: dto.type,
      objectKey,
    }).save();

    return {
      fileId: fileDoc._id.toHexString(),
      preSignedUrl,
    };
  }
}
