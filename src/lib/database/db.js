import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
export const Connection = async (username, password) => {

    const URL = `mongodb+srv://${username}:${password}@cluster0.lm1m9er.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    
    try {
        //await mongoose.connect(URL, {useUnifiedTopology: true, useNewUrlParser: true}); 
        console.log("Database connected successfully!");
      } catch (error) {
        console.error("Error while connecting with the database:", error.message);
      }
}
 
export default Connection;