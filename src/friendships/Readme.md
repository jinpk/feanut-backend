# Friends Module

## Schema

### `Friendship`

사용자는 N개의 친구 리스트를 가지는 1개의 친구 목록 도큐먼트를 가짐
사용자 회원가입 시점에 interface.initFriendShip 호출하여 도큐먼트 초기화

### Type

```bash
# 사용자 ID
userId : `ObjectId`
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
# 사용자가 설정한 친구 display Name
name: : `String`
```
