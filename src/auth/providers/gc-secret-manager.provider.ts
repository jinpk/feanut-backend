import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INSTAGRAM_AUTH_REDIRECT_PATH } from '../auth.constant';
import { InstagramMeResponse, InstagramTokenResponse } from '../interfaces';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { GOOGLE_CLOUD_PROJECT_ID } from 'src/common/common.constant';

const INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_ME_URL = 'https://graph.instagram.com/me';

@Injectable()
export class GCSecretManageProvider {
  private readonly client: SecretManagerServiceClient;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.client = new SecretManagerServiceClient({
      projectId: GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: this.configService.get('googleCloudClientEmail'),
        private_key: this.configService.get('googleCloudPrivateKey'),
      },
    });
  }
}
