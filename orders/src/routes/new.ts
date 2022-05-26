import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@dptickets_v1/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../model/ticket';
import { Order } from '../model/order';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = (1 * 60);

router.post('/api/orders', requireAuth, [
    body('ticketId').not().isEmpty().custom((input: string) => {
        return mongoose.Types.ObjectId.isValid(input);
    }).withMessage('Ticket id must be provided'),
], validateRequest, async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the ticket to order (make sure it is not reserved)
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }
    
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved.');
    }

    // Calc an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    // Build the order and save to DB
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });
    await order.save();
    // Publish an event
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    });
    res.status(201).send(order);
});

export { router as newOrderRouter };