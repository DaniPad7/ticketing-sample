import { Publisher, OrderCancelledEvent, Subjects } from "@dptickets_v1/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}