import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WrappedError } from '../errors';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus = 500;
    const responseBody = {
      module: '',
      code: -1,
      message: 'internal server error',
    };

    if (exception instanceof WrappedError) {
      httpStatus = exception.status || 500;
      responseBody.module = exception.module;
      responseBody.code = exception.code;
      responseBody.message = exception.message || '';
    } else if (exception instanceof Error) {
      responseBody.message = exception.message;
    } else {
      if (typeof exception === 'string') {
        responseBody.message = exception;
      }
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
