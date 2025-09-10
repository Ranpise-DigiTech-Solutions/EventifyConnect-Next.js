import mongoose from "mongoose";

export const Connection = async (username, password) => {

  // MONGO-DB Setup
  const databaseName = 'eventifyConnectDB';
  const URL = `mongodb+srv://${username}:${password}@cluster0.lm1m9er.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=Cluster0`;

    try {
        await mongoose.connect(URL);
        console.log("Database connected successfully!");
      } catch (error) {
        console.error("Error while connecting with the database:", error.message);
      }
}

export default Connection;