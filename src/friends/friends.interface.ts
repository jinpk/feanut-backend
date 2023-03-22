import { Types } from 'mongoose';
import { Friend } from './schemas/friend.schema';

export interface FriendsServiceInterface {
  // 친구 문서 초기화
  initUserFriendsById(userId: string | Types.ObjectId): Promise<void>;

  // 친구추가
  addFriendToList(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
    name: string,
  ): Promise<void>;

  // 친구숨김
  hideFriend(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
  ): Promise<void>;

  // 친구숨김해제
  unHideFriend(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
  ): Promise<void>;

  // 전체 친구 목록 조회 - 숨김처리하지않은
  listFriend(userId: string | Types.ObjectId): Promise<Friend[]>;

  // 숨김 친구 목록 조회 - 숨김처리하지않은
  listHiddenFriend(userId: string | Types.ObjectId): Promise<Friend[]>;
}
