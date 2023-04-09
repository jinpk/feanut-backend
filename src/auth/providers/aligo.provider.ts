import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AligoResponse } from '../interfaces';
import * as FormData from 'form-data';

const ALIGO_URL = 'https://apis.aligo.in/send/';

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
    const data = {
      sender: this.sender,
      user_id: this.userId,
      receiver,
      msg,
      testmode_yn:
        this.configService.get('env') !== 'production' &&
        this.configService.get('env') !== 'development'
          ? 'Y'
          : 'N',
    };

    if (!data.receiver.startsWith('010')) {
      return;
    }

    const form = new FormData();

    Object.keys(data).map((key) => {
      form.append(key, data[key]);
    });

    form.append('key', this.key);

    this.logger.log(`aligo request: ${JSON.stringify(data)}`);

    const res = await this.httpService.axiosRef.post<AligoResponse>(
      ALIGO_URL,
      form,
      {
        headers: { ...form.getHeaders() },
      },
    );

    this.logger.log(`aligo response: ${JSON.stringify(res.data)}`);
  }
}
