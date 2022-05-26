import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@dptickets_v1/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../model/ticket";

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // Create a fake data event
    const data: TicketCreatedEvent['data'] = { version: 0, id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert', price: 100, userId: new mongoose.Types.ObjectId().toHexString() };


    // Create a fake message object
    // @ts-ignore
    const msg: Message = { ack: jest.fn() };

    return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage with data & message object
    await listener.onMessage(data, msg);

    // assert that ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeTruthy();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});
it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage with data & message object
    await listener.onMessage(data, msg);

    // assert ack method is called
    expect(msg.ack).toHaveBeenCalled();
});