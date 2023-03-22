export default () => ({
  host: process.env.HOST,

  port: parseInt(process.env.PORT, 10) || 3001,

  mongoURI: process.env.MONGO_URI || '',
  
  jwtSecret: process.env.JWT_SECRET,
  
  env: process.env.NODE_ENV || 'local', // production | development


  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  firebaseClientId: process.env.FIREBASE_CLIENT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,

  googleCloudClientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  googleCloudPrivateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  googleCloudBucket: process.env.GOOGLE_CLOUD_BUCKET,
});
