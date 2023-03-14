# Friends Module

## Schema

### `ProfileFriends`

1개의 프로필은 1개의 친구 목록 도큐먼트를 가짐

프로필 생성시점에 interface.initProfileFriendsById 호출하여 도큐먼트 초기화

### Type

```bash
# 사용자 ID
profileId : `ObjectId`
# 친구목록
friends: : `Friends`
```

### `Friends`

친구 도큐먼트 - 프로필이 관리하는 친구목록 객체

### Type

```bash
# 추가한 친구 ID
profileId : `ObjectId`
# 친구 숨김 여부
hidden: : `Boolean`
```
