import { OrderCancelledEvent } from "@dptickets_v1/common";
import mongoose from "mongoose";
import { Ticket } from "../../../model/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Concert', price: 200, userId: 'ediedj3jdi'
    });
    ticket.set({ orderId });
    await ticket.save();
    const data: OrderCancelledEvent['data'] = {
        id: orderId, ticket: { id: ticket.id }, version: 0
    };
    // @ts-ignore
    const msg: Message = { ack: jest.fn() };
    return { msg, data, ticket, orderId, listener };
};

it('updates the ticket', async () => {
    const { msg, data, ticket, listener } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeTruthy();
});
it('publishes an event', async () => {
    const { msg, data, listener } = await setup();
    await listener.onMessage(data, msg);
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdatedData.orderId).toBeTruthy();

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
it('acks the message', async () => {
    const { msg, data, listener } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});