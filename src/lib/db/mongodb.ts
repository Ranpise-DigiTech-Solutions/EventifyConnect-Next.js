import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const username = process.env.DB_USERNAME;
        const password = process.env.DB_PASSWORD;
        const databaseName = 'eventifyConnectDB';
        const URL = `mongodb+srv://${username}:${password}@cluster0.lm1m9er.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

        await mongoose.connect(URL);

        isConnected = true;
        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};

export default connectDB;
