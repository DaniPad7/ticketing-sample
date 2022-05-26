import mongoose from "mongoose";
import { Order, OrderStatus } from '../model/order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
    id: string;
    title: string;
    price: number;              
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    /**Typescript could not pick up method addition, now can */
    findByEvent(event: { id: string; version: number; }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
/**ticket.pre('save', function(done) {
 * //@ts-ignore
 * this.$where = { version: this.get('version') - 1 };
 * }) */

ticketSchema.statics.build = (attrs: TicketAttrs): TicketDoc => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};
ticketSchema.statics.findByEvent = (event: { id: string; version: number; }) => {
    const ticket = Ticket.findOne({
        _id: event.id,
        version: event.version - 1,
    });
    return ticket;
};
ticketSchema.methods.isReserved = async function() {
    // Run query on all uncanceled orders to make sure ticket is not reserved
    const existingOrder = await Order.findOne({ ticket: this as any, status: {
        $in: [
            OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete
        ]
    } });
    return !!existingOrder;
};
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };