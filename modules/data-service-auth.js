import { client, userCollection } from "./database.js";

async function createUser(client, newUser) {
    const result = await client.db(dbName).collection(userCollection).insertOne(newUser);

    console.log(`${result.insertedCount} new user(s) created with the following id(s)`);
    console.log(result.insertedIds);
}

