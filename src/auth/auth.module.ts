import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminModule } from 'src/admin/admin.module';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
      }),
    }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    UsersModule,
    AdminModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
