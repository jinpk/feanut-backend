import { Types } from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { Friend } from './schemas/friend.schema';

export interface FriendShipsServiceInterface {
  // 친구 문서 초기화
  initFriendShip(userId: string | Types.ObjectId): Promise<void>;

  // 친구추가
  addFriendToList(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
    name: string,
  ): Promise<void>;

  // 친구숨김
  // 친구없으면 false 반환
  hideFriend(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
  ): Promise<boolean>;

  // 친구숨김해제
  // 친구없으면 false 반환
  unHideFriend(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
  ): Promise<boolean>;

  // 전체 친구 목록 조회 - 숨김처리하지않은
  listFriend(
    userId: string | Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<PagingResDto<Friend>>;

  // 숨김 친구 목록 조회 - 숨김처리하지않은
  listHiddenFriend(
    userId: string | Types.ObjectId,
    page?: number,
    limit?: number,
  ): Promise<PagingResDto<Friend>>;
}
