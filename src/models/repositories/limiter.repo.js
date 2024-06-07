'use strict'

const redis = require('redis')

const getIpUser = req => {
    return ''
}

const incr = async (key) => {
    var client = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

    const result_incr = await client.incr(key, (err, result) => {
        if (err) return err;
        return result;
    })

    await client.disconnect();

    if(result_incr) return result_incr;
    return 1;
}

const expire = async (key, ttl) => {
    var client = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
    
    await client.expire(key, ttl);

    await client.disconnect();
}

const ttl = async (key) => {
    var client = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
    
    const result_TTL = await client.ttl(key, (err, result) => {
        if (err) return err;
        return result;
    })

    await client.disconnect();

    if(result_TTL) return result_TTL;
    return false;
}

module.exports = {
    incr,
    expire,
    ttl
}