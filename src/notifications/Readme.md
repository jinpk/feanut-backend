# Notification Module

Firebase Messaging Service 사용하여 푸시 알림 처리

## 알림 종류

### 수신 알림 `pull`

사용자가 투표하여 Polling 생성되었을 경우 Polling의 selectedProfileId가 알림 수신자.

`pull` 알림은 interfaces.NotificationData의 value에 pollingId 셋팅

1. selectedProfileId로 profile 스키마에 ownerId가 있는지 확인하고
2. ownerId로 notification-user-config 조회
3. notification-user-config에 `receivePull`: true 와 `fcmToken` 값이 있는 경우만 data 담아서 알림메시지 전송

```bash
알림 제목: 남사친이 {이름}님을 투표했어요!
알림 메시지: {투표 제목}
```

### 투표 알림 `poll`