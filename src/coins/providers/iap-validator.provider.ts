import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import GoogleReceiptVerify from 'google-play-billing-validator';
import { ANDROID_PACKAGE_NAME } from 'src/common/common.constant';
import { ItunesValidationResponse } from '../enums';

@Injectable()
export class IAPValidatorProvider {
  private readonly logger = new Logger(IAPValidatorProvider.name);
  private readonly email: string;
  private readonly playKey: string;
  private readonly appStoreKey: string;
  private readonly itunesVerifyURL: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.email = this.configService.get('googleCloudClientEmail');
    this.playKey = this.configService.get('googleCloudPrivateKey');
    this.appStoreKey = this.configService.get('appStoreSecret');

    const env = this.configService.get('env');
    this.itunesVerifyURL = `https://${
      env === 'production' ? 'buy' : 'sandbox'
    }.itunes.apple.com/verifyReceipt`;
  }

  async validateGooglePurchase(
    product_id: string,
    token: string,
  ): Promise<void> {
    const googleReceiptVerify = new GoogleReceiptVerify({
      email: this.email,
      key: this.playKey,
    });

    googleReceiptVerify.verifyINAPP;
    const response = await googleReceiptVerify.verifyINAPP({
      packageName: ANDROID_PACKAGE_NAME,
      productId: product_id,
      purchaseToken: token,
    });

    if (!response?.isSuccessful) {
      throw new Error(response.errorMessage);
    }
  }

  async validateIOSPurchase(receipt: string): Promise<void> {
    console.log(this.itunesVerifyURL, this.appStoreKey, receipt);
    const res = await this.httpService.axiosRef.post<ItunesValidationResponse>(
      this.itunesVerifyURL,
      {
        'receipt-data': receipt,
        password: this.appStoreKey,
        'exclude-old-transactions': true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(
      `Itunes IAP Verification Response: ${JSON.stringify(res.data)}`,
    );

    if (res.data.status !== 0) {
      throw new Error(
        'iOS 인앱 결제 검증 실패하였습니다. code: ' + res.data.status,
      );
    }
  }
}
