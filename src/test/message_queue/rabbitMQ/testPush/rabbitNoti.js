'use strict';

const amqp = require('amqplib');

const log = console.log;

console.log = function(){
    log.apply(console, [new Date()].concat(arguments));
}

const ProducerNoti = async ({noti_Id, noti_senderId, shopId}) => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const notificationExchange = `notificationExPubSub${shopId}`;

        await channel.assertExchange(notificationExchange, 'fanout', {
            durable: false,
        });
        const data = {noti_Id, noti_senderId}

        await channel.publish(notificationExchange, '', Buffer.from(JSON.stringify(data)));

        console.log(`Publish Noti ${noti_Id}`);

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

ProducerNoti({noti_Id: 12345, noti_senderId: 'userId', shopId: 'shopdev'}).catch(console.error);
