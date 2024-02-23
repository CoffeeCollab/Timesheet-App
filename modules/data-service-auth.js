import { client, userCollection, dbName } from "./database.js";
import bcrypt from 'bcrypt';

const saltRounds = 10;

async function createUser(client, newUser) {
    const hashedPassword = await hashPassword(newUser.password);
    newUser.password = hashedPassword;

    const result = await client.db(dbName).collection(userCollection).insertOne(newUser);

    console.log(`${result.name} new user(s) created in users database`);

    return result;
}

async function isUserIdExists(userId) {
    const result = await client.db(dbName).collection(userCollection).findOne({ _id: userId });
  
    return !!result;
}

async function getUserByEmail(email) {
    const result = await client.db(dbName).collection(userCollection).findOne({email: email})
}

async function hashPassword(password){
    return await bcrypt.hash(password, saltRounds)
}

export {
    createUser,
    isUserIdExists,
    getUserByEmail,
  };
