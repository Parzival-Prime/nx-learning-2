"use server"

import { kafka } from "@packages/utils/kafka"

const producer = kafka.producer()

export async function sendTestEvent() {
  await producer.connect()

  console.log("\n Test event produced \n")
  await producer.send({
    topic: "user-events",
    messages: [
      {
        value: JSON.stringify({
          userId: "u1",
          productId: "p1",
          shopId: "s1",
          action: "product_view"
        })
      }
    ]
  })
  await producer.disconnect()
}


export async function sendKafkaEvent(eventData: EventDataType){
    try {
        await producer.connect()
        await producer.send({
            topic: "user-events",
            messages: [{value: JSON.stringify(eventData)}]
        })
    } catch (error) {
        console.log(error)
    } finally {
        await producer.disconnect()
    }
}


type EventDataType =  {
    userId?: string;
    productId?: string;
    shopId?: string;
    action: string;
    device?: string;
    country?: string;
    city?: string
}