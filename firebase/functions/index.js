const functions = require('firebase-functions');
const { app } = require('./server/src/test');

exports.api = functions.https.onRequest(app);