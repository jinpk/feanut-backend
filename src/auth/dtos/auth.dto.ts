import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ title: 'authId' })
  authId: string;
}
