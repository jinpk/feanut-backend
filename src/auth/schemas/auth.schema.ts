import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AUTH_MODULE_NAME } from '../auth.constant';
import { AuthPurpose } from '../enums';

export type AuthDocument = HydratedDocument<Auth>;

// 회원가입 인증 관리
@Schema({ collection: AUTH_MODULE_NAME, timestamps: true })
export class Auth {
  @Prop({ required: true })
  phoneNumber: string;

  // verification code (6 digit)
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: AuthPurpose })
  purpose: string;

  // purpose payload
  @Prop({})
  payload: string;

  // verified
  @Prop({})
  verified: boolean;

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
