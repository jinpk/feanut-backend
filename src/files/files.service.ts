import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFileDto, CreateFileResponseDto } from './dtos';
import { File, FileDocument } from './schemas/files.schema';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async updateUploadedState(fileId: string) {
    await this.fileModel.findByIdAndUpdate(fileId, {
      $set: { isUploaded: true },
    });
  }

  async createFileWithPreSignedUrl(
    userId: string,
    dto: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    let ext: string;

    switch (dto.mimetype) {
      case 'image/png':
        ext = 'png';
        break;
      case 'image/jpeg':
        ext = 'jpeg';
        break;
    }

    const objectKey = `uploads/${dto.type}-${userId}-${Date.now()}.${ext}`;

    let preSignedUrl = '';
    /*const preSignedUrl = await this.awsS3Service.genPreSignedUploadUrl(
      objectKey,
    );*/

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
