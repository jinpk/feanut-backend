import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { AuthEventListener } from './auth.listener';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailService } from 'src/common/providers/mail.provider';
import { Admin, AdminSchema } from 'src/admin/schemas/admin.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
      }),
    }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    UsersModule,
  ],
  providers: [AuthService, AuthEventListener, JwtStrategy, MailService],
  exports: [AuthService],
})
export class AuthModule {}
