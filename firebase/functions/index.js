const { app } = require('../../server/src/library_server');

const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
exports.api = functions.https.onRequest(app);