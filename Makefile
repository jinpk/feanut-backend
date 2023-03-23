# git rev-parse --short HEAD

# Env
get-env-development:
	gcloud storage cp gs://bucket.feanut.com/env/.env.development .env.development 

put-env-development:
	gcloud storage cp .env.development gs://bucket.feanut.com/env/.env.development