# ENV 관리

## GOOGLE CLOUND SDK 설치
```bash
# install google-cloud-sdk 
brew install —cask google-cloud-sdk 
# login to google cloud
# 담당자에게 권한 요청한 계정으로 로그인
gcloud auth login
# project 설정
gcloud config set project feanut
```

## ENV 다운로드
```bash
# 1. download development env
make get-env-development
# 2. make env for local
mv .env.development .env
```

## ENV 업로드
local .env에서만 관리되는 환경변수 localhost 등을 .env.development로 업데이트하지 마십시오.

```bash
# 1. get latest version of .env.development
make get-env-development

# 2. update local .env > .env.development

# 3. update .env.development
make put-env-development
```