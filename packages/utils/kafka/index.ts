import { Kafka } from "kafkajs"


export const kafka = new Kafka({
    clientId: "kafka-service",
    brokers: ["d5thq8esf2u990b840qg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
    ssl: true,
    sasl: {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_API_KEY!,
        password: process.env.KAFKA_API_SECRET!
    }
})