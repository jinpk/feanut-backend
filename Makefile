get-env-development:
	aws s3 cp s3://files.feanut/envs/backend/.env.development .env.development

put-env-development:
	aws s3 cp .env.development s3://files.feanut/envs/backend/.env.development