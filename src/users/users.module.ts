import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  FriendShipSchema,
  Friendship,
} from 'src/friendships/schemas/friendships.schema';
import { Profile, ProfileSchema } from 'src/profiles/schemas/profile.schema';
import { UsersPublicController } from './users-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendShipSchema },
    ]),
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
  ],
  providers: [UsersService],
  controllers: [UsersController, UsersPublicController],
  exports: [UsersService],
})
export class UsersModule {}
