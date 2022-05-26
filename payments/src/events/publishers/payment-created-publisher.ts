import { Subjects, Publisher, PaymentCreatedEvent } from "@dptickets_v1/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}