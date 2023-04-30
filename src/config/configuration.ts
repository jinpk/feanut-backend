export default () => ({
  env: process.env.NODE_ENV || 'local', // production | development

  port: parseInt(process.env.PORT || '3000'),

  host: process.env.HOST,

  mongoURI: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,

  googleCloudClientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  googleCloudPrivateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  googleCloudBucket: process.env.GOOGLE_CLOUD_BUCKET,

  googlePlayClientEmail: process.env.GOOGLE_PLAY_CLIENT_EMAIL,
  googlePlayPrivateKey: process.env.GOOGLE_PLAY_PRIVATE_KEY,

  aligoAPIKey: process.env.ALIGO_API_KEY,
  aligoUserId: process.env.ALIGO_USER_ID,
  aligoSender: process.env.ALIGO_SENDER,

  appStoreSecret: process.env.APPSTORE_SECRET,

  instagramAppId: process.env.INSTAGRAM_APP_ID,
  instagramAppSecret: process.env.INSTAGRAM_APP_SECRET,
});
