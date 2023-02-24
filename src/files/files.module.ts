import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AWSS3Service } from 'src/common/providers';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File, FileSchmea } from './schemas/files.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchmea }]),
  ],
  controllers: [FilesController],
  providers: [AWSS3Service, FilesService],
})
export class FilesModule {}
