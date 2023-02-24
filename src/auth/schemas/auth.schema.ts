import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AUTH_MODULE_NAME } from '../auth.constant';

export type AuthDocument = HydratedDocument<Auth>;

// 로그인 인증코드 및 토큰 관리
@Schema({ collection: AUTH_MODULE_NAME, timestamps: true })
export class Auth {
  // 로그인 이메일
  @Prop({ lowercase: true })
  email: string;

  // 로그인 휴대폰번호
  @Prop({})
  phoneNumber: string;

  // verification code (6 digit)
  @Prop({ required: true })
  code: string;

  // 인증토큰 생성시간
  // 인증 만료 (3분)
  @Prop()
  createdAt?: Date;
}

export const AuthSchmea = SchemaFactory.createForClass(Auth);
