const functions = require('firebase-functions');

function FirebaseConfig() {
    this.cfg = convertConfig();

    function convertConfig() {
        const firebaseConfig = functions.config();
        const ENV = process.env.NODE_ENV;

        // use firebase local config is by default
        let configUsed = firebaseConfig.local;

        // switch to firebase prod config if NOV_ENV is in prod
        if (ENV === 'production') {
            configUsed = firebaseConfig.prod;
        }

        const fbDefault = firebaseConfig.default;
        const fbDefaultDb = fbDefault ? fbDefault.db : {};
        const fbDb = configUsed.db || {};
        const fbAuth = configUsed.auth || {};
        const fbResources = configUsed.resources || {};
        const fbJwt = configUsed.jwt || {};
        const ifWaitForConnections = fbDefaultDb.waitForConnections ? fbDefaultDb.waitForConnections === 'true' : true;

        return {
            db: {
                host: fbDb.host,
                user: fbDb.user,
                password: fbDb.password,
                database: fbDb.database,
                // firebase config doesn't allow upper case for keys
                connectionLimit: parseInt(fbDefaultDb.connectionlimit || '10'),
                connectTimeout: parseInt(fbDefaultDb.connecttimeout || '10000'), // 10 seconds
                acquireTimeout: parseInt(fbDefaultDb.acquiretimeout || '10000'), // 10 seconds
                waitForConnections: ifWaitForConnections === 'true',
                queueLimit: parseInt(fbDefaultDb.queuelimit || '5'),
                timezone: fbDefaultDb.timezone
            },
            auth: {
                salt: fbAuth.salt,
                cookie: fbAuth.cookie,
                session: fbAuth.session,
            },
            resources: {
                coversUrl: fbResources.coversurl,
            },
            jwt: {
                secret: fbJwt.secret,
            },
            "sycamore-auth": {
                "school-id": fbDefault["sycamore-auth"]["school-id"],
                "url": fbDefault["sycamore-auth"]["url"],
                "success-text": fbDefault["sycamore-auth"]["success-text"]
            }
        }
    }
}

var firebaseConfig = new FirebaseConfig();
module.exports = firebaseConfig.cfg;

