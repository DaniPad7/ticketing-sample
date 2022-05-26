import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; version: number; status: OrderStatus; userId: string; expiresAt: string; ticket: { id: string; price: number; }; }, msg: Message) {
        const order = Order.build({
            id: data.id, price: data.ticket.price, status: data.status,
            userId: data.userId, version: data.version
        });
        await order.save();
        msg.ack();
    }
    
}