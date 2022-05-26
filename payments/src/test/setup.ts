import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

// process.env.STRIPE_KEY=Is in user env;


// MongoDB in memory allows to run test-suite aat the same time without reaching out to
// MongoDB instance, direct  memory accessw
let mongo: MongoMemoryServer;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';/**Should change */
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(() => {
    // used to be await and await and async function
    mongo.stop();
    return mongoose.connection.close();
});

global.signin = (id?: string) => {
    // Build a JST payload { id, email }
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object. { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take the JSON and encode it as Base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return string with cookie
    return [`session=${base64}`];
};