import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import { FilterQuery, Model } from 'mongoose';
import { ComparePasswordDto, CreateUserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  async createUser(dto: CreateUserDto): Promise<string> {
    const doc = await new this.userModel({
      name: dto.name,
      birthYear: dto.birthYear,
      gender: dto.gender,
      username: dto.username,
      password: await this.genHashPassword(dto.password),
    }).save();

    return doc.id;
  }

  async genHashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);
    return hashed;
  }

  async verifyPassword(dto: ComparePasswordDto): Promise<boolean> {
    return new Promise((resolve, reject) => {
      compare(dto.password, dto.hashed, (err, verified) => {
        if (err) {
          reject(err);
        } else {
          resolve(verified);
        }
      });
    });
  }
}
