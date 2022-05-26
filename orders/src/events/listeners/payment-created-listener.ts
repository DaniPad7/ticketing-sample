import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; orderId: string; stripeId: string; }, msg: Message) {
        const order = await Order.findById(data.orderId);
        if (!order) {
            throw new Error("Order not found.");
        }
        order.set({
            status: OrderStatus.Complete
        });
        await order.save();
        msg.ack();
    }
    
}