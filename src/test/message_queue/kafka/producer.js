const { Kafka, logLevel } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:29092'],
  logLevel: logLevel.ERROR
})

//Now to produce a message to a topic, we'll create a producer using our client:

const producer = kafka.producer()

const runProducer = async () => {
    await producer.connect()
    await producer.send({
    topic: 'test-topic',
    messages: [
        { value: 'Hello KafkaJS user!' },
    ],
    })

    await producer.disconnect()
}

runProducer().catch(console.error)