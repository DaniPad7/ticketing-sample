import { Publisher, OrderCreatedEvent, Subjects } from "@dptickets_v1/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}