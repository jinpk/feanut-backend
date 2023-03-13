# ENV 관리

* 담당자에게 AWS ACCESS KEY 발급 필요

## AWS CLI 설치
```bash
# install awscli 
brew install awscli
# login to aws
aws configure
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