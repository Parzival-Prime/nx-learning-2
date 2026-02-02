import { kafka } from "@packages/utils/kafka"
import { updateUserAnalytics } from "./services/analytics.service"

const consumer = kafka.consumer({ groupId: "user-events-group" })

const eventQueue: any[] = []

async function processQueue(){
  if(eventQueue.length === 0) return

  const events = [...eventQueue]
  eventQueue.length = 0

  for(const event of events){
    if(event.action === "shops_visit"){

    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_wishlist",
      "remove_from_cart"
    ]

    if(!event.action || !validActions.includes(event.action)){
      continue
    }

    try {
      await updateUserAnalytics(event)
    } catch (error) {
      console.log("Error processing event: ", error)
    }
  }
}


setInterval(processQueue, 3000);


export async function consumeKafkaMessages(){
    await consumer.connect()
    await consumer.subscribe({ topic: "user-events", fromBeginning: false})

    await consumer.run({
      eachMessage: async({message})=>{
        if(!message.value) return

        const event = JSON.parse(message.value.toString())
        eventQueue.push(event)
      }
    })
}

consumeKafkaMessages().catch(console.error)