export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoURI: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET,
  env: process.env.NODE_ENV || 'local', // production | development
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
