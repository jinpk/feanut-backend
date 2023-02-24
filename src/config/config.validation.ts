import * as joi from 'joi';

export const validationSchema = joi.object({
  PORT: joi.number().required(),
  MONGO_URI: joi.string().required(),
  JWT_SECRET: joi.string().required(),
  AWS_REGION: joi.string().required(),
  AWS_ACCESS_KEY_ID: joi.string().required(),
  AWS_SECRET_ACCESS_KEY: joi.string().required(),
});
