import { Module } from '@nestjs/common';
import { PromotionSchoolsController } from './schools.controller';
import { PromotionSchoolsService } from './schools.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PromotionSchool,
  PromotionSchoolSchema,
} from './schemas/school.schema';
import {
  PromotionSchoolVote,
  PromotionSchoolVoteSchema,
} from './schemas/vote.schema';
import {
  PromotionSchoolCampaign,
  PromotionSchoolCampaignSchema,
} from './schemas/campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromotionSchool.name, schema: PromotionSchoolSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: PromotionSchoolCampaign.name,
        schema: PromotionSchoolCampaignSchema,
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
