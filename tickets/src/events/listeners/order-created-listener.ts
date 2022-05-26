import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@dptickets_v1/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; version: number; status: OrderStatus; userId: string; expiresAt: string; ticket: { id: string; price: number; }; }, msg: Message) {
        // Find the ticket the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw error
        if (!ticket) {
            throw new Error("Ticket Not Found");
        }

        // Mark the ticket as being reserved by setting orderId property
        ticket.set({ orderId: data.id });

        // Save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id, price: ticket.price, title: ticket.title,
            userId: ticket.userId, version: ticket.version, orderId: ticket.orderId
        });

        // ack the message
        msg.ack();
    }

}