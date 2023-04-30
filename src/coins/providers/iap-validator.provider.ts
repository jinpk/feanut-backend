import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import GoogleReceiptVerify from 'google-play-billing-validator';
import { ANDROID_PACKAGE_NAME } from 'src/common/common.constant';
import { ItunesValidationResponse } from '../enums';
import { AppStoreResponse } from '../interfaces';
import { InAppPurchasePayloadResponse } from 'google-play-billing-validator';

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
    this.email = this.configService.get('googlePlayClientEmail');
    this.playKey = this.configService.get('googlePlayPrivateKey');
    this.appStoreKey = this.configService.get('appStoreSecret');

    const env = this.configService.get('env');

    this.itunesVerifyURL = `https://${
      env === 'production' ? 'buy' : 'sandbox'
    }.itunes.apple.com/verifyReceipt`;
  }

  async validateGooglePurchase(
    productId: string,
    purchaseToken: string,
  ): Promise<InAppPurchasePayloadResponse> {
    const googleReceiptVerify = new GoogleReceiptVerify({
      email: this.email,
      key: this.playKey,
    });

    const response = await googleReceiptVerify.verifyINAPP({
      packageName: ANDROID_PACKAGE_NAME,
      productId: productId,
      purchaseToken: purchaseToken,
    });

    if (!response?.isSuccessful) {
      throw new Error(response.errorMessage);
    }

    return response.payload;
  }

  async validateIOSPurchase(receipt: string): Promise<AppStoreResponse> {
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

    const data = res.data as AppStoreResponse;

    if (data.status !== 0) {
      throw new Error('iOS 결제 실패 하였습니다. code: ' + res.data.status);
    }

    return data;
  }
}
