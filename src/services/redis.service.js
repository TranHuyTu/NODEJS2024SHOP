'use strict';

const { getRedis } = require('../dbs/init.redis');
const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');

const pexpire = async () => {
    return await promisify((await getRedis()).pExpire).bind(getRedis);
}
const setexAsync = async () => {
    return await promisify((await getRedis()).setEx).bind(getRedis);
}

const acquireLock = async ( productId, quantity, cardId ) => {
    const key = `lock_v2023_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000;

    for(let i = 0; i < retryTimes; i++) {
        // Tao 1 key
        const result = await setexAsync(key, expireTime);
        console.log(`result:::${result}`);
        if(result === 1){
            const isReservation = await reservationInventory({
                productId, quantity, cardId
            });
            if(isReservation.modifiedCount){
                await pexpire(key, expireTime);
                return key;
            }
            return null;
        }else{
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify((await getRedis()).del).bind(getRedis);
    return await delAsyncKey(keyLock);
}

module.exports = {
    acquireLock,
    releaseLock
}