'use strict';

const amqp = require('amqplib');

const runConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const notificationExchange = 'notificationEx';

        await channel.assertExchange(notificationExchange, 'fanout', {
            durable: false,
        });
        
        const {
            queue
        } = await channel.assertQueue('', {
            exclusive: true,
        });

        console.log(queue);

        await channel.bindQueue(queue, notificationExchange, '');

        channel.consume( queue, (message) => {
            console.log(`NotiID ${message.content.toString()}`);
        },{
            noAck: true,
        })

    } catch (error) {
        console.error(error);
    }
}

runConsumer().catch(console.error);