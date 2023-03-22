import * as joi from 'joi';

export const validationSchema = joi.object({
  HOST: joi.string().uri().required(),

  MONGO_URI: joi.string().required(),

  JWT_SECRET: joi.string().required(),

  FIREBASE_PROJECT_ID: joi.string().required(),
  FIREBASE_PRIVATE_KEY_ID: joi.string().required(),
  FIREBASE_PRIVATE_KEY: joi.string().required(),
  FIREBASE_CLIENT_ID: joi.string().required(),
  FIREBASE_CLIENT_EMAIL: joi.string().required(),

  GOOGLE_CLOUD_CLIENT_EMAIL: joi.string().required(),
  GOOGLE_CLOUD_PRIVATE_KEY: joi.string().required(),
  GOOGLE_CLOUD_BUCKET: joi.string().required(),
});
