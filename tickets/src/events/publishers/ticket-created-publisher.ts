import { Publisher, Subjects, TicketCreatedEvent } from '@dptickets_v1/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
