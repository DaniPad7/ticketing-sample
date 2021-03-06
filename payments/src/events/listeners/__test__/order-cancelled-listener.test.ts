import { OrderCancelledEvent, OrderStatus } from "@dptickets_v1/common";
import mongoose from "mongoose";
import { Order } from "../../../model/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 100, status: OrderStatus.Created, userId: "duidiojej8", version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id, ticket: { id: "cdfjcedfi" }, version: 1
    };
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg, order };
};

it('updates the status of the order', async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});