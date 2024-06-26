'use strict';

const amqp = require('amqplib');
const messages = 'Hello RabbitMQ for User0402';

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const queueName = 'test-topic';
        await channel.assertQueue(queueName, {
            durable: true,
        })

        channel.sendToQueue( queueName, Buffer.from(messages));
        console.log(`message sent ${messages}`);

    } catch (error) {
        console.error(error);
    }
}

runProducer().catch(console.error);