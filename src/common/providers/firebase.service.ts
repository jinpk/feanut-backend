import { Injectable, Logger } from '@nestjs/common';
import { PushParams } from '../interfaces';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  constructor(private configService: ConfigService) {
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
      .then((res) => {
        this.logger.log(
          `Firebase Messaing successfully sent: ${res.responses
            .map((x) => x.messageId)
            .join(', ')}`,
        );
      })
      .catch((error) => {
        this.logger.error(
          `Firebase Messaing sendAll error: ${JSON.stringify(error)}`,
        );
      });
  }
}
