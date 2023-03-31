import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('NETWORK');
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, url, ip, path, user, headers } = req;
    res.on('finish', () => {
      const { statusCode } = res;
      const userAgent = req.get('user-agent') || '';
      if (statusCode >= 400) {
        this.logger.error(
          `${method} ${statusCode} - ${originalUrl} - ${ip} - ${userAgent}`,
        );
      } else {
        this.logger.log(
          `${method} ${statusCode} - ${originalUrl} - ${ip} - ${userAgent}`,
        );
      }
    });
    next();
  }
}
