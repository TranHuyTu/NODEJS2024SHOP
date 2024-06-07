'use strict'

const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:29092'],
})

//Now to produce a message to a topic, we'll create a producer using our client:

const consumer = kafka.consumer({ groupId: 'test-group' })

const runConsumer = async () => {
    await consumer.connect()
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

    await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log({
        value: message.value.toString(),
        })
    },
    })
}

runConsumer().catch(console.error)
