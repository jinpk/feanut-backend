import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.adminModel.findOne({ username });

    if (admin && (await admin.comparePassword(password))) {
      return admin._id;
    }

    return null;
  }

  async findById(id: string): Promise<AdminDocument | false> {
    const user = await this.adminModel.findById(id);
    if (!user) {
      return false;
    }
    return user;
  }
}
