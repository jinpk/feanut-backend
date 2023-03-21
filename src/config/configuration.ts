export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  mongoURI: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET,
  env: process.env.NODE_ENV || 'local', // production | development

  host: process.env.HOST,

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  firebaseClientId: process.env.FIREBASE_CLIENT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  googleAPIKey: process.env.GOOGLE_API_KEY,

  playConsoleClientEmail: process.env.PLAYCONSOLE_CLIENT_EMAIL,
  playConsolePrivateKey: process.env.PLAYCONSOLE_PRIVATE_KEY,
});
