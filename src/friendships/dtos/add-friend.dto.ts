import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class AddFriendDto {
  @ApiProperty({ title: '휴대폰번호', description: '-없이 숫자만 11자리' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(11)
  phoneNumber: string;

  @ApiProperty({
    title: '설정할 친구이름',
    description: '연락처에 저장되어 있는 이름',
  })
  @IsNotEmpty()
  name: string;
}

export class AddFriendByProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  profileId: string;
}

export class AddFriendManyDto {
  @ApiProperty({ title: '추가할 연락처 목록', description: '숫자만' })
  contacts: { name: string; phoneNumber: string }[];

  @ApiProperty({
    title: '추가할 연락처 목록',
    description: '숫자만',
    required: false,
  })
  invalidContacts: {
    displayName: string;
    givenName: string;
    familyName: string;
    middleName: string;
    phoneNumbers: string[];
  }[];
}
