import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "timesheet_app";
const collectionName = "hoursRecords";

async function main() {
    try {
        await client.connect();
        await listDatabases(client);
        // await createUser(client, {
        //     _id: 1,
        //     name: "Henrique Sagara",
        //     workedDays: []
        // });

        // await timeIn(client, 1)
        await timeOut(client, 1)

        // await deleteRecordById(client, 1)

        await queryAllRecords(client)
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => {
        console.log(`-${db.name}`);
    });
}

// Create new user
async function createUser(client, newUser) {
    const result = await client.db(dbName).collection(collectionName).insertOne(newUser);

    console.log(`${result.insertedCount} new user(s) created with the following id(s)`);
    console.log(result.insertedIds);
}


async function queryAllRecords(client){
    const cursor = client.db(dbName).collection(collectionName).find();
    const allRecords = await cursor.toArray();

    console.log(allRecords)
}

async function timeIn(client, userId) {
    const currentDate = new Date();
    const day = currentDate.toLocaleDateString('en-US')
    const timeIn = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    const user = {_id: userId};
    const update = {
        $push: {
            workedDays: {
                shift: {
                    date: day,
                    timeIn: timeIn,
                }
            }
        }
    }

    await client.db(dbName).collection(collectionName).updateOne(user, update)
}

async function timeOut(client, userId){
    const currentDate = new Date();
    const timeOut = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    const user = {_id: userId}
    const update = {
        $set: {
          'workedDays.$[lastShift].shift.timeOut': timeOut,
          'workedDays.$[lastShift].shift.workedHours': calculateWorkedHours(client, userId),
        },
      };
    
      // Identify the array element to update (the last shift in the workedDays array)
      const arrayFilters = [{ 'lastShift.shift.timeOut': null }];
    
      const result = await client.db(dbName).collection(collectionName).updateOne(user, update, { arrayFilters });
    
      if (result.modifiedCount === 1) {
        console.log(`Time-out recorded successfully for user with id ${userId}`);
      } else {
        console.log(`No user found with id ${userId} or no time-in recorded`);
      }
}

// Helper function to calculate worked hours
async function calculateWorkedHours(client, userId) {
    const user = { _id: userId };
    const projection = { workedDays: { $slice: -1 } }; // Retrieve the last element in the workedDays array
    const result = await client.db(dbName).collection(collectionName).findOne(user, projection);
  
    if (result && result.workedDays && result.workedDays.length > 0) {
      const lastShift = result.workedDays[0].shift;
      if (lastShift.timeIn && lastShift.timeOut) {
        const timeIn = new Date(lastShift.timeIn);
        const timeOut = new Date(lastShift.timeOut);
        const workedHours = (timeOut - timeIn) / (1000 * 60 * 60); // Convert milliseconds to hours
        return parseFloat(workedHours.toFixed(2)); // Return worked hours as a number
      }
    }
  
    return null; // Return null if there is missing data
  }

async function deleteRecordById(client, userId) {
    const filter = { _id: userId };
  
    // Delete the record with the specified id
    const result = await client.db(dbName).collection(collectionName).deleteOne(filter);
  
    if (result.deletedCount === 1) {
      console.log(`Record with id ${userId} deleted successfully`);
    } else {
      console.log(`No record found with id ${userId}`);
    }
  }