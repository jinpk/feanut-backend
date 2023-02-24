import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailLoginEvent, PhoneNumberLoginEvent } from './events';

@Injectable()
export class AuthEventListener {
  private readonly logger = new Logger(AuthEventListener.name);

  // 이메일로 코드 전송
  @OnEvent(EmailLoginEvent.name)
  handleEmailLoginEvent(payload: EmailLoginEvent) {
    this.logger.log(
      `${EmailLoginEvent.name} detected: ${JSON.stringify(payload)}`,
    );
  }

  // 휴대폰번호로 코드 전송
  @OnEvent(PhoneNumberLoginEvent.name)
  handlePhoneNumberLoginEvent(payload: PhoneNumberLoginEvent) {
    this.logger.log(
      `${PhoneNumberLoginEvent.name} detected: ${JSON.stringify(payload)}`,
    );
  }
}
