import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends PickType(UserDto, [
  'name',
  'username',
  'birthYear',
  'gender',
]) {
  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  password: string;
}
