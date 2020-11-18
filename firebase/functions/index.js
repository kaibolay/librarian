const server = require('./server/src/library_server_function');
const functions = require('firebase-functions');

exports.api = functions.https.onRequest(server.server);

