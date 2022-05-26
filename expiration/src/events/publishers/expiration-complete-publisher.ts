import { Subjects, Publisher, ExpirationCompleteEvent } from "@dptickets_v1/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}