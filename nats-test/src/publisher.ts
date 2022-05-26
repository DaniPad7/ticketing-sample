import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

stan.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({ id: '123', price: 200, title: 'concert' });

    } catch(err) {console.error(err);}
    

    // const data = JSON.stringify({
    //     id: '123',
    //     title: 'concert',
    //     price: 200
    // });

    // stan.publish('ticket:created', data, () => console.log('Event published'))
});

// kubectl port-forward nats-depl-7dd7854db8-m2h5k 4222:4222
// kubectl port-forward nats-depl-7dd7854db8-m2h5k 8222:8222