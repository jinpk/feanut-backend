import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qs from 'querystring';
import { AligoResponse } from '../interfaces';

@Injectable()
export class AligoProvider {
  private readonly logger = new Logger(AligoProvider.name);
  private readonly key: string;
  private readonly userId: string;
  private readonly sender: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.key = this.configService.get('aligoAPIKey');
    this.userId = this.configService.get('aligoUserId');
    this.sender = this.configService.get('aligoSender');
  }

  async sendSMS(receiver: string, msg: string) {
    const data = qs.stringify({
      key: this.key,
      user_id: this.userId,
      sender: this.sender,
      receiver,
      msg,
      testmode_yn: this.configService.get('env') !== 'production' ? 'Y' : 'N',
    });

    this.logger.log(`aligo request: ${JSON.stringify(data)}`);

    const res = await this.httpService.axiosRef.post<AligoResponse>(
      `https://apis.aligo.in/send`,
      data,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      },
    );

    this.logger.log(`aligo response: ${JSON.stringify(res.data)}`);
  }
}
