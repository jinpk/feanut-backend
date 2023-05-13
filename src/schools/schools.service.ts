import { Injectable } from '@nestjs/common';
import { School, SchoolDocument } from './schemas/school.schema';
import mongoose, {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
} from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UtilsService } from 'src/common/providers';
import { ListSchoolDto, SchoolDto, UserSchoolDto } from './dtos';
import { UserSchool, UserSchoolDocument } from './schemas/user-school.schema';
import {
  SCHOOL_MODULE_NAME,
  SCHOOL_SCHEMA_NAME,
  USER_SCHOOL_SCHEMA_NAME,
  SCHOOL_ERROR_RECENT_DATE,
} from './schools.constants';
import * as dayjs from 'dayjs';
import { WrappedError } from 'src/common/errors';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    @InjectModel(UserSchool.name)
    private userSchoolModel: Model<UserSchoolDocument>,
    private readonly utilsService: UtilsService,
  ) {}

  async getUserSchool(
    userId: string | mongoose.Types.ObjectId,
  ): Promise<null | UserSchoolDto> {
    const school = await this.userSchoolModel.aggregate<UserSchoolDto>([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          disabled: { $ne: true },
        },
      },
      {
        $lookup: {
          from: SCHOOL_SCHEMA_NAME,
          localField: 'code',
          foreignField: 'code',
          as: 'schools',
        },
      },
      {
        $unwind: {
          path: '$schools',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          grade: 1,
          name: '$schools.name',
          code: '$schools.code',
        },
      },
    ]);

    return school[0];
  }

  async checkUserSchoolDate(userId: string | mongoose.Types.ObjectId) {
    const userSchoolInfo = await this.userSchoolModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      disabled: { $ne: true },
    });

    if (!userSchoolInfo) {
      return true
    }

    if (userSchoolInfo[0].createdAt > dayjs().subtract(14, 'day').toDate()) {
      throw new WrappedError(
        SCHOOL_MODULE_NAME,
        SCHOOL_ERROR_RECENT_DATE,
        '최근변경 후 14일이 지나야 합니다.',
      ).reject();
    } else {
      return true
    }
  }

  async disabledLatestUserSchool(userId: string | mongoose.Types.ObjectId) {
    const prevSchools = await this.userSchoolModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      disabled: { $ne: true },
    });
    prevSchools.forEach((x) => {
      x.disabled = true;
      x.save();
    });
  }

  async insertUserSchool(
    userId: string | mongoose.Types.ObjectId,
    code: string,
    grade: number,
    room: string,
  ) {
    // 코드 검증
    if (!(await this.schoolModel.findOne({ code }))) {
      throw new WrappedError(
        SCHOOL_MODULE_NAME,
        undefined,
        '유효하지 않은 학교 코드',
      ).reject();
    }

    // 학교 변경 날짜 확인
    await this.checkUserSchoolDate(userId);

    // 이전학교 비활성화 처리
    await this.disabledLatestUserSchool(userId);

    // 신규학교 저장
    await new this.userSchoolModel({
      userId: new mongoose.Types.ObjectId(userId),
      room,
      grade,
      code,
    }).save();
  }

  async listSchool(query: ListSchoolDto) {
    const filter: FilterQuery<School> = {
      $expr: {
        $or: [
          {
            $regexMatch: { input: '$name', regex: query.keyword, options: 'i' },
          },
          {
            $regexMatch: { input: '$sido', regex: query.keyword, options: 'i' },
          },
          {
            $regexMatch: {
              input: '$sigungu',
              regex: query.keyword,
              options: 'i',
            },
          },
        ],
      },
    };

    const projection: ProjectionFields<SchoolDto> = {
      _id: 0,
      name: 1,
      sido: 1,
      sigungu: 1,
      address: 1,
      code: 1,
      joinedCount: { $size: '$us' },
    };

    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: USER_SCHOOL_SCHEMA_NAME,
          let: { code: '$code' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$code', '$code'] },
                    { $ne: ['$disabled', true] },
                  ],
                },
              },
            },
          ],
          as: 'us',
        },
      },
      { $project: projection },

      {
        $sort: {
          name: 1,
        },
      },
    ];

    pipeline.push(
      this.utilsService.getCommonMongooseFacet({
        page: query.page,
        limit: query.limit,
      }),
    );
    const cursor = await this.schoolModel.aggregate(pipeline);
    const metdata = cursor[0].metadata;
    const data = cursor[0].data;
    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
