import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        
        return;
    }

    try {
        const username = process.env.DB_USERNAME;
        const password = process.env.DB_PASSWORD;
        const databaseName = 'eventifyConnectDB';
        const URL = `mongodb+srv://${username}:${password}@cluster0.lm1m9er.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

        await mongoose.connect(URL);

        isConnected = true;
        
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw new Error('Database connection error');
    }
};

export default connectDB;
