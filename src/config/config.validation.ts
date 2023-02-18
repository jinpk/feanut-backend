import * as joi from 'joi';

export const validationSchema = joi.object({
  PORT: joi.number().required(),
  MONGO_URI: joi.string().required(),
  JWT_SECRET: joi.string().required(),
});
