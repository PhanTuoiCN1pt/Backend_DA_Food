const admin = require("firebase-admin");

// Import key từ Firebase Console (serviceAccountKey.json tải về từ Firebase)
const serviceAccount = require("../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
