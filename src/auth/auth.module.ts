import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchmea } from './schemas/auth.schema';
import { AuthEventListener } from './auth.listener';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
      }),
    }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchmea }]),
    UsersModule,
  ],
  providers: [AuthService, AuthEventListener],
  exports: [AuthService],
})
export class AuthModule {}
