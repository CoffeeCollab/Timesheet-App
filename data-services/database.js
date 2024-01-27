import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "timesheet_app";
const collectionName = "hoursRecords";

// Function to connect to the MongoDB server
async function connectToDatabase() {
  try {
      // Connect to the MongoDB server
      await client.connect();
      console.log("Connected to the database");
  } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error; // Rethrow the error to handle it in the calling function
  }
}


export { client, dbName, collectionName, connectToDatabase };