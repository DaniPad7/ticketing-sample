import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name"

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; version: number; ticket: { id: string; }; }, msg: Message) {
        const order = await Order.findOne({ _id: data.id, version: data.version - 1 });

        if (!order) {
            throw new Error('Order Not Found');
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();
        msg.ack();
    }
    
    
}