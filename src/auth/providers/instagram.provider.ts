import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INSTAGRAM_AUTH_REDIRECT_PATH } from '../auth.constant';
import { InstagramMeResponse, InstagramTokenResponse } from '../interfaces';

const INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_ME_URL = 'https://graph.instagram.com/me';

@Injectable()
export class InstagramProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly host: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.clientId = this.configService.get('instagramAppId');
    this.clientSecret = this.configService.get('instagramAppSecret');
    this.host = this.configService.get('host');
  }

  async parseCode(code: string): Promise<string> {
    console.log(INSTAGRAM_TOKEN_URL, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: `${this.host}${INSTAGRAM_AUTH_REDIRECT_PATH}`,
      grant_type: 'authorization_code',
      code,
    });

    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: `${this.host}${INSTAGRAM_AUTH_REDIRECT_PATH}`,
      grant_type: 'authorization_code',
      code,
    };

    const res = await this.httpService.axiosRef.post<InstagramTokenResponse>(
      INSTAGRAM_TOKEN_URL,
      Object.keys(body)
        .map((key) => `${key}=${body[key]}`)
        .join('&'),
    );

    const resMe = await this.httpService.axiosRef.get<InstagramMeResponse>(
      INSTAGRAM_ME_URL,
      {
        params: {
          fields: 'username',
          access_token: res.data.access_token,
        },
      },
    );

    return resMe.data.username;
  }
}
