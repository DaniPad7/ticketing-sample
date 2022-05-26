import mongoose from "mongoose";
import request from "supertest";
import { Order } from "../../model/order";
import { app } from "../../app";
import { OrderStatus } from "@dptickets_v1/common";
import { stripe } from '../../stripe';
import { Payment } from "../../model/payment";


it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
    .post('/api/payments')
    .set("Cookie", global.signin())
    .send({
        token: "djnhsdjnh",
        orderId: new mongoose.Types.ObjectId().toHexString()
    }).expect(404);
});
it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(), price: 200,
        status: OrderStatus.Created, userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set("Cookie", global.signin())
    .send({
        token: "djnhsdjnh",
        orderId: order.id
    }).expect(401);
});
it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 200, status: OrderStatus.Cancelled, userId, version: 0
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set("Cookie", global.signin(userId))
    .send({
        orderId: order.id, token: "cdmkedfjmk"
    }).expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price, status: OrderStatus.Created, userId, version: 0
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set("Cookie", global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id
    }).expect(201);
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');
    const payment = await Payment.findOne({ orderId: order.id, stripeId: stripeCharge!.id });
    expect(payment).not.toBeNull();
    // const chargedOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargedOptions.source).toEqual('tok_visa');
    // expect(chargedOptions.amount).toEqual(200 * 100);
    // expect(chargedOptions.currency).toEqual('usd');
});
