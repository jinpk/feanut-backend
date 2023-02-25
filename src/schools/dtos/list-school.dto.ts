import { IntersectionType, PickType } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dtos';
import { SchoolDto } from './school.dto';

export class ListSchoolDto extends IntersectionType(
  PagingReqDto,
  PickType(SchoolDto, ['name']),
) {}
