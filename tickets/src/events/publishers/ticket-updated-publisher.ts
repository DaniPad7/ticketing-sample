import { Publisher, Subjects, TicketUpdatedEvent } from '@dptickets_v1/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}