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
        // await timeOut(client, 1)
        

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
    const timeInNum = currentDate.getTime();

    const user = {_id: userId};
    const update = {
        $push: {
            workedDays: {
                shift: {
                    fullDate: currentDate,
                    date: day,
                    timeIn: timeIn,
                    timeInNum: timeInNum,
                }
            }
        }
    }

    await client.db(dbName).collection(collectionName).updateOne(user, update)
}

async function timeOut(client, userId) {
  const currentDate = new Date();
  const timeOut = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const timeOutNum = currentDate.getTime();

  const user = { _id: userId };
  const update = {
    $set: {
      'workedDays.$[day].shift.timeOut': timeOut,
      'workedDays.$[day].shift.timeOutNum': timeOutNum,
    },
  };
  const options = { arrayFilters: [{ 'day.shift.timeOut': { $exists: false } }] };

  await client.db(dbName).collection(collectionName).updateOne(user, update, options);

  await calculateWorkedHours(client, userId);
}

async function calculateWorkedHours(client, userId) {
  const user = { _id: userId };
  const projection = { workedDays: { $slice: -1 } };
  const result = await client.db(dbName).collection(collectionName).findOne(user, projection);
  const lastTimeIn = result.workedDays[0].shift.timeInNum;
  const lastTimeOut = result.workedDays[0].shift.timeOutNum;
  

  const update = {
    $set: {
      'workedDays.$[day].shift.workedHours': parseFloat((lastTimeOut - lastTimeIn) / (1000 * 60 * 60)), 
    },
  }
  const options = { arrayFilters: [{ 'day.shift.workedHours': { $exists: false } }] };
  await client.db(dbName).collection(collectionName).updateOne(user, update, options);
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