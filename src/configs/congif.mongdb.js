'use strict';

const dev = {
    app:{
        port: process.env.DEV_APP_PORT || 3052
    },
    db:{
        host: process.env.DEV_DB_HOST || 'tranhuytu37',
        port: process.env.DEV_DB_PORT || 'r8e9UQDNDHjTQEQ0@clusternodejs.jqoqqp9.mongodb.net',
        name: process.env.DEV_DB_NAME || 'dbDev',
    }
}

const pro={
    app:{
        port: process.env.PRO_APP_PORT || 3000
    },
    db:{
        host: process.env.PRO_DB_HOST || 'tranhuytu37',
        port: process.env.PRO_DB_PORT || 'r8e9UQDNDHjTQEQ0@clusternodejs.jqoqqp9.mongodb.net',
        name: process.env.PRO_DB_NAME || 'shopKaiba',
    }
}

const config = {dev, pro}
const env = process.env.NODE_ENV || 'dev'

module.exports = config[env]