import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@dptickets_v1/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../model/ticket";

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    // Create and save a ticket
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), title: "Concert",
    price: 200 });
    await ticket.save();

    // Create a fake data event
    const data: TicketUpdatedEvent['data'] = { version: ticket.version + 1, id: ticket.id,
    title: 'New Concert', price: 1000, userId: new mongoose.Types.ObjectId().toHexString() };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = { ack: jest.fn() };

    return { listener, data, msg, ticket };
};

it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});
it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
it('does not call ack if the event is out of order', async () => {
    const { listener, data, msg } = await setup();
    data.version = 10;
    try{
        await listener.onMessage(data, msg);
    } catch(err) {}

    expect(msg.ack).not.toHaveBeenCalled();
});