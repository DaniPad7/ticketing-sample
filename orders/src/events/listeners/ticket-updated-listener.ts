import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@dptickets_v1/common';
import { Ticket } from '../../model/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject: Subjects = Subjects.TicketUpdated;
    queueGroupName: string  = queueGroupName;
    async onMessage(data: { id: string; title: string; price: number; userId: string; version: number; }, msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('Ticket Not Found');
        }
        const { title, price /**version, */ } = data;
        ticket.set({ title, price /**version */ });
        await ticket.save();

        msg.ack();
    }
    
}