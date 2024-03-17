'use strict'

const {getRedis} = require('../../dbs/init.redis');

const getIpUser = req => {
    return ''
}

const incr = async (key) => {
    return (await getRedis()).incr(key, (err, result) => {
        if (err) return err;
        return result;
    })
}

const expire = async (key, ttl) => {
    return (await getRedis()).expire(key, parseInt(ttl));
}

const ttl = async (key) => {
    return (await getRedis()).ttl(key, (err, result) => {
        if (err) return err;
        return result;
    })
}

module.exports = {
    incr,
    expire,
    ttl
}