'use strict';
const amqp = require('amqplib');

async function consumerOrderedMessage() {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const queueName = 'queuedMessageChatBox';
        await channel.assertQueue(queueName, {
            durable: true,
        })

        for(let i = 0; i < 10; i++) {
            const message = `ordered-queue-message...${i}`;
            console.log(message);
            channel.sendToQueue( queueName, Buffer.from(message), {
                persistent: true,
            });
        }

        setTimeout(() => {
            connection.close();
        }, 1000)

    } catch (error) {
        console.error(error);
    }
}

consumerOrderedMessage().catch((error) => console.error(error));
