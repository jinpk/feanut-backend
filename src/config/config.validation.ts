import * as joi from 'joi';

export const validationSchema = joi.object({
  MONGO_URI: joi.string().required(),
  JWT_SECRET: joi.string().required(),
  AWS_REGION: joi.string().required(),
  AWS_ACCESS_KEY_ID: joi.string().required(),
  AWS_SECRET_ACCESS_KEY: joi.string().required(),

  HOST: joi.string().uri().required(),

  FIREBASE_PROJECT_ID: joi.string().required(),
  FIREBASE_PRIVATE_KEY_ID: joi.string().required(),
  FIREBASE_PRIVATE_KEY: joi.string().required(),
  FIREBASE_CLIENT_ID: joi.string().required(),
  FIREBASE_CLIENT_EMAIL: joi.string().required(),
  GOOGLE_API_KEY: joi.string().required(),
});
