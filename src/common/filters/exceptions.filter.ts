import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WrappedError } from '../errors';

interface ErrorResponseBody {
  module: string;
  code: number;
  message: any;
  statusCode?: any;
  error?: any;
}

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus = 500;
    let responseBody: ErrorResponseBody = {
      module: '',
      code: -1,
      message: 'internal server error',
    };
    console.log(exception);
    if (exception instanceof WrappedError) {
      httpStatus = exception.status || 500;
      responseBody.module = exception.module || '';
      responseBody.code = exception.code || -1;
      responseBody.message = exception.message || '';
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus() || 500;
      const response = exception.getResponse();
      if (typeof response === 'string') {
        responseBody.message = response;
      } else {
        responseBody = {
          ...responseBody,
          ...response,
        };
        delete responseBody.statusCode;
        delete responseBody.error;
      }
    } else if (exception instanceof Error) {
      responseBody.message = exception.message;
    } else {
      responseBody.message = exception;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
