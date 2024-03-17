'use strict';

const redis = require('redis');
const { RedisErrorResponse } = require('../core/error.response');

let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error',
}, connectionTimeout;

const REDIS_CONNECT_TIMEOUT = 10000, REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: 'Có lỗi kết mối xảy ra với server Redis rồi sếp ơi !!!!',
        en: 'service connection error'
    }
}

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisErrorResponse(REDIS_CONNECT_MESSAGE.message.en)
    }, REDIS_CONNECT_TIMEOUT)
}

const handleEventConnection = ({
    connectionRedis
}) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`connectionRedis - Connection status: connected`);
        clearTimeout(connectionTimeout);
    })
    .on(statusConnectRedis.END, () => {
        console.log(`connectionRedis - Connection status: disconnected`);
        connectionRedis.disconnect();
    })
    .on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionRedis - Connection status: reconnecting`);
        clearTimeout(connectionTimeout);
    })
    .on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionRedis - Connection status: ${err}`);
        handleTimeoutError();
    })
    .connect();
}

const initRedis = async () =>{
    const instanceRedis = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })

    handleEventConnection({
        connectionRedis: instanceRedis
    });

    client.instanceConnect = instanceRedis;
};

const getRedis = async () => {
    return await client.instanceConnect;
};

const closeRedis = () => {

};

module.exports = {
    initRedis,
    getRedis,
    closeRedis
}