# How to login?

## Email Login

1. /login/email API 호출
2. Server에서 이메일 주소로 인증코드 전송
3. 인증코드와 이메일 주소, 유효시간 3분 정보를 가진 Token 반환
4. /login API 호출
5. 검증후 JWT Access Token 반환

## PhoneNumber Login

1. /login/phone API 호출
2. Server에서 이메일 주소로 인증코드 전송
3. 인증코드와 이메일 주소, 유효시간 3분 정보를 가진 Token 반환
4. /login API 호출
5. 검증후 JWT Access Token 반환
