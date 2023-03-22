import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AUTH_MODULE_NAME } from '../auth.constant';

export type AuthDocument = HydratedDocument<Auth>;

// 회원가입 인증 관리
@Schema({ collection: AUTH_MODULE_NAME, timestamps: true })
export class Auth {
  // hashedPhoneNumber
  @Prop({ required: true })
  hashedPhoneNumber: string;

  // verification code (6 digit)
  @Prop({ required: true })
  code: string;

  // `${username}\n${name}\n${birth}\n${gender}}`
  @Prop({ required: true })
  payload: string;

  // used state
  @Prop({})
  used: boolean;

  // loggedAt
  @Prop({})
  usedAt: Date;

  // 인증토큰 생성시간
  // 인증 만료 (3분)
  @Prop()
  createdAt?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
