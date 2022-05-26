import mongoose from 'mongoose';
import { app } from './app';


const start = async () => {
    console.log('Starting Up...');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to mongodb');
    } catch(err){
        console.log(err);
    }

    app.listen(3000, () => console.log('Listening on Port 3000!!!Heyo2o0o0o0o0o0'));
};

start();