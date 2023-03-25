import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { FriendsModule } from 'src/friendships/friendships.module';
import { CoinsModule } from 'src/coins/coins.module';
import { UsersExistenceController } from './users-existence.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProfilesModule,
    FriendsModule,
    CoinsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController, UsersExistenceController],
  exports: [UsersService],
})
export class UsersModule {}
