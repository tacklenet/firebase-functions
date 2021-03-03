const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const processIG = require("./process-ig");

exports.processIG = functions.firestore
  .document("/submissions/{id}")
  .onWrite(processIG.handler);
