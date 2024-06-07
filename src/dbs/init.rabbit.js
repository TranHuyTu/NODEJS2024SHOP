'use strict'

const amqp = require('amqplib');

const connectToRabbitMQ = async()=>{
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        if(!connection) throw new Error('Connection not established');

        const chanel = await connection.createChannel();

        return {chanel, connection};
    } catch (error) {
        console.error('Error connecting',error);
    }
}

const connectToRabbitMQTest = async()=>{
    try {
        const {chanel, connection} = await connectToRabbitMQ();

        //Publish message to a queue
        const queue = 'test-queue';
        const message = 'Hello, ShopDev by User0402';
        await chanel.assertQueue(queue);
        await chanel.sendToQueue(queue, Buffer.from(message));

        await connection.close();
    } catch (error) {
        console.error('Error connecting',error);
    }
}

const consumerQueue = async( chanel, queueName)=>{
    try {
        await chanel.assertQueue(queueName, {durable: true});
        console.log('Waiting for messages ...');
        chanel.consume( queueName, msg => {
            console.log(`Received message: ${queueName}::`, msg.content.toString());
            //1. find user following tag SHOP
            //2. Send message to User
            //3. yes, ok ==> success
            //4. error, setup DLX
        },{
            noAck: true
        })
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    connectToRabbitMQ,
    connectToRabbitMQTest,
    consumerQueue
}