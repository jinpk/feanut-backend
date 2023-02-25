import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PagingResDto } from '../dtos';

export const ApiOkResponsePaginated = <DataDto extends Type>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(PagingResDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PagingResDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );
