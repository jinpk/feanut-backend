import { Injectable } from '@nestjs/common';
import { DynamicLinkQuery, PushParams } from '../interfaces';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import GoogleReceiptVerify from "google-play-billing-validator";
import { ANDROID_PACKAGE_NAME, IOS_BUNDLE_ID } from '../common.constant'

@Injectable()
export class PurchaseService {
    private readonly email: string;
    private readonly playkey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.email = this.configService.get('googleCloudClientEmail');
    this.playkey = this.configService.get('googleCloudPrivateKey');
  }

  async validateGooglePurchase(product_id: string, token: string) {
      const googleReceiptVerify = new GoogleReceiptVerify({
        email: this.email,
        key: this.playkey
      });

      const response = await googleReceiptVerify.verifySub({
        packageName: ANDROID_PACKAGE_NAME,
        productId: product_id,
        purchaseToken: token,
      });

      return response
  }

  async validateIOSPurchase(token: string) {
      
  }
}
