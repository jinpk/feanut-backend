import { Injectable } from '@nestjs/common';
import { DynamicLinkQuery, PushParams } from '../interfaces';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  ANDROID_PACKAGE_NAME,
  DYNAMICLINK_POST_URL,
  DYNAMICLINK_URL_PREFIX,
  IOS_BUNDLE_ID,
} from '../common.constant';

@Injectable()
export class FirebaseService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('firebaseProjectId'),
        clientEmail: this.configService.get('firebaseClientEmail'),
        privateKey: this.configService
          .get('firebasePrivateKey')
          .replace(/\\n/g, '\n'),
      }),
    });
  }

  sendPush(params: PushParams) {
    if (!params.payload) {
      params.payload = {};
    }
    Object.keys(params.payload).map((key) => {
      if (typeof params.payload[key] !== 'string') {
        params.payload[key] = String(params.payload[key]);
      }
    });

    admin
      .messaging()
      .sendAll(
        params.tokens.map((x) => ({
          token: x,
          android: {
            priority: 'high',
          },
          notification: {
            title: params.title,
            body: params.message,
          },
          data: {
            title: params.title,
            body: params.message,
            ...params.payload,
          },
        })),
      )
      .catch((error) => {
        console.error('Firebase Messaging sendAll errors: ', error);
      });
  }
}
