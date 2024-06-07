'use strict';

const amqp = require('amqplib');
const { random } = require('lodash');
const messages = 'new a product';

const log = console.log;

console.log = function(){
    log.apply(console, [new Date()].concat(arguments));
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const runProducer = async () => {
    console.log(messages);
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const notificationExchange = 'notificationEx';
        const notificationQueue = 'notificationQueueProcess';
        const notificationExchangeDLX = 'notificationExDLX';
        const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX';

        //1. Create Exchange
        // await channel.assertExchange(notificationExchange, 'direct', {
        //     durable: true,
        // });
        //2. Create Queue
        const queueResult = await channel.assertQueue(notificationQueue, {
            exclusive: false,
            deadLetterExchange: notificationExchangeDLX,
            deadLetterRoutingKey: notificationRoutingKeyDLX
        })

        //3. bind Queue
        await channel.bindQueue(queueResult.queue, notificationExchange);

        //4. Send message
        // const msg = 'a new product THTD';
        // console.log(`Product msg: ${msg}`);

        await channel.sendToQueue(queueResult.queue, Buffer.from(generateRandomString(10)), {
            expiration: '10000'
        });

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

runProducer().catch(console.error);

module.exports = {
    runProducer
}