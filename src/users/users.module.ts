import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchmea } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FilesModule } from 'src/files/files.module';
import { UsersEventListener } from './users.listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchmea }]),
    FilesModule,
  ],
  providers: [UsersService, UsersEventListener],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
