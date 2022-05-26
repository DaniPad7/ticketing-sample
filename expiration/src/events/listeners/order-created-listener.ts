import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; version: number; status: OrderStatus; userId: string; expiresAt: string; ticket: { id: string; price: number; }; }, msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting this many milliseconds to process the job ', delay);
        
        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });
        msg.ack();
    }

}