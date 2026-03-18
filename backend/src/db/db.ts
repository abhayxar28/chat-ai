import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        console.log('Connected to mongodb')
    } catch (error) {
        console.error('Error connecting to mongodb', error)
    }
}

export default connectDB;