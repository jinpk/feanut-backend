import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { KAKAO_API_HOST, KAKAO_API_PATH_ME } from '../auth.constant';
import { Gender } from 'src/profiles/enums';

@Injectable()
export class KakaoAuthProvider {
  constructor(private httpService: HttpService) {}

  async me(accessToken: string) {
    const res = await this.httpService.axiosRef.post(
      KAKAO_API_HOST + KAKAO_API_PATH_ME,
      {
        secure_resource: true,
        property_keys: [] || [
          'profile_nickname',
          'profile_image',
          'account_email',
          'gender',
          'birthyear',
          'birthday',
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = res.data;

    if (!data.id) {
      throw new Error('조회할 수 없는 카카오 계정입니다.');
    }
    console.log(data);

    const id = (data.id as bigint).toString();
    const profile_image = data.properties?.profile_image as string;
    const thumbnail_image = data.properties?.thumbnail_image as string;
    const email = (
      data.kakao_account?.has_email ? data.kakao_account?.email : ''
    ) as string;

    const birthday = data.kakao_account?.birthday as string; // YYY
    const gender = data.kakao_account?.gender
      ? (data.kakao_account?.gender as Gender)
      : '';

    return {
      id,
      profile_image,
      thumbnail_image,
      email,
      birthday,
      gender,
    };
  }
}
