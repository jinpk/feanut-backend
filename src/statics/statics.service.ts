import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTryOpenLogDto } from './dtos';
import { TryOpenLog, TryOpenLogDocument } from './schemas/try-open-log.schema';


@Injectable()
export class StaticsService {
  constructor(
    @InjectModel(TryOpenLog.name) private tryopenlogModel: Model<TryOpenLogDocument>,
  ) {}

  async createTryOpenLog(
    userId: string | Types.ObjectId,
    dto: CreateTryOpenLogDto,
  ) {

    const doc = new this.tryopenlogModel({
      userId: new Types.ObjectId(userId),
      pollingId: new Types.ObjectId(dto.pollingId)
    });

    await doc.save();
  }
}
