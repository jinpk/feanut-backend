import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { FeanutJwtPayload } from 'src/auth/interfaces';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('NETWORK');
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, url, ip, path, user, headers } = req;
    res.on('finish', () => {
      const { statusCode } = res;
      const userAgent = req.get('user-agent') || '';

      const user = res.req.user ? (res.req.user as FeanutJwtPayload) : null;
      let requester = '';
      if (user) {
        if (user.isAdmin) {
          requester = `admin(${user.id})`;
        } else {
          requester = `user(${user.id})`;
        }
      }

      if (statusCode >= 400) {
        this.logger.error(
          `${method} ${statusCode} ${originalUrl} ${ip} ${requester} ${userAgent}`,
        );
      } else {
        this.logger.log(
          `${method} ${statusCode} ${originalUrl} ${ip} ${requester} ${userAgent}`,
        );
      }
    });
    next();
  }
}
