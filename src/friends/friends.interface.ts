import { Friend } from './schemas/friend.schema';

export interface FriendsServiceInterface {
  // 친구 문서 생성
  initProfileFriendsById(profileId: string): Promise<void>;

  // 친구추가
  addFriendToList(profileId: string, friendProfileId: string): Promise<void>;

  // 친구숨김
  hideFriend(profileId: string, friendProfileId: string): Promise<void>;

  // 친구숨김해제
  unHideFriend(profileId: string, friendProfileId: string): Promise<void>;

  // 전체 친구 목록 조회 - 숨김처리하지않은
  listFriend(profileId: string): Promise<Friend[]>;

  // 숨김 친구 목록 조회 - 숨김처리하지않은
  listHiddenFriend(profileId: string): Promise<Friend[]>;
}
