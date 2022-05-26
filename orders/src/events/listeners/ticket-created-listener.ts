import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@dptickets_v1/common';
import { Ticket } from '../../model/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: { id: string; title: string; price: number; userId: string; }, msg: Message) {
        const { id, title, price } = data;
        const ticket = Ticket.build({
            title, price, id
        });
        await ticket.save();

        msg.ack();
        
    }
    
}
