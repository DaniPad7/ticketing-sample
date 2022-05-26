import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// var rl = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
// rl.on('rs', () => process.emit('SIGINT'));
    // rl.on('SIGTERM', () => process.emit('SIGTERM'));

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222'
});

stan.on('connect', () => {
    console.log('Listener connected to NATS');

    stan.on('close', () => {
        console.log('NATS Connection closed');
        process.exit();
    });

    new TicketCreatedListener(stan).listen();
});

// process.on('SIGINT', () => stan.close()); /**Currently does not work
/**  See https://nodejs.org/api/process.html for ore info on Node events*/
// process.on('SIGTERM', () => stan.close()); comment
console.log(process.pid, process.platform);




