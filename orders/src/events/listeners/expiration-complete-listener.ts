import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../model/order";
import { OrderCancelledPublisher } from "../publisher/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete  = Subjects.ExpirationComplete;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { orderId: string; }, msg: Message) {
        const order =  await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error('Order not found.');
        }
        if (order.status === OrderStatus.Complete) {
            return msg.ack();/**To postman test:
            Create order and send payment to that order within 60s of initial order
             */
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id, ticket: { id: order.ticket.id }, version: order.version
        });
        msg.ack();
    }

}