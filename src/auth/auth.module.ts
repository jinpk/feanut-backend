import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AligoProvider } from './providers/aligo.provider';
import { HttpModule } from '@nestjs/axios';
import { InstagramProvider } from './providers';
import { ProfilesModule } from 'src/profiles/profiles.module';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
      }),
    }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    UsersModule,
    ProfilesModule,
  ],
  providers: [AuthService, JwtStrategy, AligoProvider, InstagramProvider],
  exports: [AuthService],
})
export class AuthModule {}
