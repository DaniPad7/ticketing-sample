import { Listener, OrderCancelledEvent, Subjects } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; version: number; ticket: { id: string; }; }, msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error("Ticket Not Found");
        }
        ticket.set({ orderId: undefined });
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id, price: ticket.price, title: ticket.title,
            userId: ticket.userId, version: ticket.version, orderId: ticket.orderId
        });
        msg.ack();
    }
}