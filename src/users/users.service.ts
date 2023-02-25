import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { PatchUserDto } from './dtos';
import { UserPatchedEvent } from './events';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  // @Services

  async patchUser(id: string, dto: PatchUserDto) {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      throw new NotFoundException();
    }

    if (dto.birth) {
      user.birth = dto.birth;
    }

    if (dto.gender) {
      user.gender = dto.gender;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (typeof dto.profileImageId === 'string') {
      user.profileImageId = dto.profileImageId
        ? new Types.ObjectId(dto.profileImageId)
        : null;
    }

    await user.save();

    this.eventEmitter.emit(
      UserPatchedEvent.name,
      new UserPatchedEvent(id, dto),
    );
  }

  // @Repositories

  async findActiveUserOne(
    filter: FilterQuery<UserDocument>,
  ): Promise<User | null> {
    const user = await this.userModel.findOne({
      ...filter,
      isDeleted: false,
    });

    if (!user) {
      return null;
    }

    return user.toObject();
  }

  async createAccountWithPhoneNumber(phoneNumber: string): Promise<string> {
    const user = await new this.userModel({ phoneNumber }).save();
    return user._id.toHexString();
  }

  async createAccountWithEmail(email: string): Promise<string> {
    const user = await new this.userModel({ email }).save();
    return user._id.toHexString();
  }
}
