import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../model/order';
import { Ticket } from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);

});
it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 100,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const order =  Order.build({
         ticket,
         userId: 'wh8whd8sh',
         status: OrderStatus.Created,
         expiresAt: new Date()
    });
    await order.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);


});
it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'Concert After',
        price: 120,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order:created event', async () => {
    const ticket = Ticket.build({
        title: 'Concert After',
        price: 120,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});