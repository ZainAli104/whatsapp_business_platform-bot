const admin = require('firebase-admin');
const fs = require('fs/promises');
const path = require('path');

const usersCollectionPromise = (async () => {
  const serviceAccountPath = path.join(__dirname, './whatsapp-business-platform-firebase-adminsdk-5aj3d-31557a0a25.json');
  const serviceAccountRaw = await fs.readFile(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountRaw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const firestore = admin.firestore();
  const usersCollection = firestore.collection('users');

  return usersCollection;
})();

exports.usersCollectionPromise = usersCollectionPromise;
