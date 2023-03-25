import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PipelineStage } from 'mongoose';

@Injectable()
export class UtilsService {
  formatDate(date: Date | string, format?: 'date' | 'date-time') {
    if (!date) {
      return '';
    }
    switch (format) {
      case 'date-time':
        return dayjs(date).format('YYYY-MM-DD HH:mm');
      default:
        return dayjs(date).format('YYYY-MM-DD');
    }
  }

  getCommonMongooseFacet(query): PipelineStage {
    return {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: (parseInt(query.page) - 1) * parseInt(query.limit) },
          { $limit: parseInt(query.limit) },
        ],
      },
    };
  }
}
