import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(
    to: string,
    subject: string,
    body: string,
    from = 'Feanut',
  ): Promise<string> {
    const res = await this.mailerService.sendMail({
      to,
      from: `${from} <noreply@feanut.com>`,
      subject,
      text: body,
    });
    return res.messageId;
  }
}
