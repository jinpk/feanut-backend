# ENV 관리

환경변수는 Goole Cloud Secrets Manager로 관리됩니다.

production | development 각 환경의 적합한 환경변수가 Cloud Run Cluster에 주입됩니다.

## GET

local에서 필요한 환경변수 파일은 담당자에게 요청하세요.

## PUT

개발중 변경필요한 | 추가된 환경변수는 `config` module에 추가 및 유효성 검사 코드를 업데이트하고

production, development에 필요한 {key}={value} 값과 함께 담당자에게 반영 요청해 주세요.
