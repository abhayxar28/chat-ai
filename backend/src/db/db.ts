import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        console.log('Connected to mongodb')
    } catch (error) {
        console.error('Error connecting to mongodb', error)
        process.exit(1);
    }
}

async function disconnectDB() {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from mongodb');
    } catch (error) {
        console.error('Error disconnecting from mongodb', error);
    }
}

export { connectDB, disconnectDB };
export default connectDB;