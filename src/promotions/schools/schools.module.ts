import { Module } from '@nestjs/common';
import { PromotionSchoolsController } from './schools.controller';
import { PromotionSchoolsService } from './schools.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PromotionSchool,
  PromotionSchoolSchema,
} from './schemas/school.schema';
import {
  PromotionSchoolStudent,
  PromotionSchoolStudentSchema,
} from './schemas/student.schema';
import {
  PromotionSchoolVote,
  PromotionSchoolVoteSchema,
} from './schemas/vote.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromotionSchool.name, schema: PromotionSchoolSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: PromotionSchoolStudent.name,
        schema: PromotionSchoolStudentSchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: PromotionSchoolVote.name, schema: PromotionSchoolVoteSchema },
    ]),
  ],
  controllers: [PromotionSchoolsController],
  providers: [PromotionSchoolsService],
})
export class PromotionSchoolsModule {}
