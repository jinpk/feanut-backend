import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import GoogleReceiptVerify from 'google-play-billing-validator';
import { ANDROID_PACKAGE_NAME, IOS_BUNDLE_ID } from '../common.constant';
import { request } from 'http';
import iap from 'iap';

@Injectable()
export class PurchaseService {
  private readonly email: string;
  private readonly playkey: string;
  private readonly appstorekey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.email = this.configService.get('googleCloudClientEmail');
    this.playkey = this.configService.get('googleCloudPrivateKey');
    this.appstorekey = this.configService.get('appStoreSecret');
  }

  async validateGooglePurchase(product_id: string, token: string) {
    const googleReceiptVerify = new GoogleReceiptVerify({
      email: this.email,
      key: this.playkey,
    });

    const response = await googleReceiptVerify.verifySub({
      packageName: ANDROID_PACKAGE_NAME,
      productId: product_id,
      purchaseToken: token,
    });

    return response;
  }

  async validateIOSPurchase(token: string) {
    //   const verifyURL = 'https://sandbox.itunes.apple.com/verifyReceipt';

    //   const options = {
    //       uri: verifyURL,
    //       method: 'POST',
    //       headers: {
    //           "User-Agent": "Request-Promise",
    //           "Content-Type": "application/x-www-form-urlencoded",
    //       },
    //       json: true,
    //       form: '',
    //   };

    //   options.form = JSON.stringify({
    //       "receipt-data": token,
    //       "password": this.appstorekey
    //   });

    //   return await request(options)

    const platform = 'apple';
    const payment = {
      receipt: token, // always required
      packageName: IOS_BUNDLE_ID,
      secret: this.appstorekey,
      excludeOldTransactions: true,
    };
    return await iap.verifyPayment(platform, payment);
  }
}
