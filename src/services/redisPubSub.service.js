'use strict';

const redis = require('redis');

class RedisPubSubService {

    constructor(){
        this.subscriber = redis.createClient({
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_POST
            }
        }).duplicate();
        this.publisher = redis.createClient({
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_POST
            }
        });
    }

    async publish( channel, message ){
        await this.publisher.on('connect', () => {
            console.log(`CONNECTED SERVICE PUBLIC`);
        }).connect();
        await this.publisher.publish(channel, JSON.stringify(message));
    }

    async subscribe( channel, callback ){
        await this.subscriber
        .on('connect', () => {
            console.log(`CONNECTED SERVICE SUBSCRIBE`);
        }).connect();

        await this.subscriber.subscribe(channel, (message, channel_sub) => {
            if(message){
                callback(channel_sub,message)
            }
            console.log(`Subscribed to ${channel_sub} channels.`);
        });
    }
}

module.exports = new RedisPubSubService();