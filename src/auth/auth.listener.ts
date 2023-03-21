import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailLoginEvent } from './events';

@Injectable()
export class AuthEventListener {
  private readonly logger = new Logger(AuthEventListener.name);

  constructor() {}

  // 이메일로 코드 전송
  @OnEvent(EmailLoginEvent.name)
  handleEmailLoginEvent(payload: EmailLoginEvent) {
    this.logger.log(
      `${EmailLoginEvent.name} detected: ${JSON.stringify(payload)}`,
    ); /*
    this.mailService
      .send(payload.email, '로그인 인증', payload.code)
      .then((res) => {
        this.logger.log('sent auth email: ' + res);
      })
      .catch((error) => {
        this.logger.error(error);
      });*/
  }
}
