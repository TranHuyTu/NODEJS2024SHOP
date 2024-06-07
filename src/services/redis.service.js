'use strict';

// const { getRedis } = require('../dbs/init.redis');
const redis = require('redis')
const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');
const { getProductByProductId } = require('../models/repositories/product.repo');

const setExpire = async (key, expireTime) => {
    var client = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
    
    await client.expire(key, expireTime);

    await client.disconnect();
}

const setNX = async(key, expireTime) => {
    var client = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

    await client.set(key, 'value', {
        EX: expireTime,
        NX: true
    });
    const value = await client.get(key);
    await client.disconnect();

    if(!value) {
        return 0;
    }

    return 1;
}

const delKey = async(key) => {
    var client = await redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_POST
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

    const value = await client.del(key);
    await client.disconnect();

    if(!value) {
        return 0;
    }

    return 1;
}

const acquireLock = async ( productId, quantity, cardId, shopId) => {
    const key = `lock_v2023_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000;

    for(let i = 0; i < retryTimes; i++) {
        // Tao 1 key
        const result = await setNX(key, expireTime);
        if(result === 1){
            console.log('Redis::',productId, quantity, cardId, shopId);
            const isReservation = await reservationInventory({
                productId, quantity, cardId, shopId
            });
            console.log(`reservation:::${isReservation.modifiedCount}`);
            if(isReservation.modifiedCount){
                await setExpire(key, expireTime);
                return key;
            }
            return null;
        }else{
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

const releaseLock = async keyLock => {
    return await delKey(keyLock);
}

module.exports = {
    acquireLock,
    releaseLock
}