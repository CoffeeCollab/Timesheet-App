import { client, dbName, collectionName, connectToDatabase } from "./database.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    manager: {type: String},
    isManager: { type: Boolean, default: false},
});

let User;

