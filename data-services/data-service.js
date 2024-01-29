import { client, dbName, collectionName, connectToDatabase } from "../data-services/database.js";

// Call the connectToDatabase function to establish the connection
connectToDatabase();

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
    const timeIn = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
    const timeInNum = currentDate.getTime();

    const user = {_id: userId};
    const update = {
        $push: {
            workedDays: {
                shift: {
                    fullDateIn: currentDate,
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
  const timeOut = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
  const timeOutNum = currentDate.getTime();

  const user = { _id: userId };
  const update = {
    $set: {
      'workedDays.$[day].shift.fullDateOut': currentDate,
      'workedDays.$[day].shift.timeOut': timeOut,
      'workedDays.$[day].shift.timeOutNum': timeOutNum,
    },
  };
  const options = { arrayFilters: [{ 'day.shift.timeOut': { $exists: false } }] };

  await client.db(dbName).collection(collectionName).updateOne(user, update, options);

  await calculateWorkedHours(client, userId);

}

async function calculateWorkedHours(client, userId) {
  try {
    const user = { _id: userId };
    const projection = { workedDays: { $slice: -1 } };
    const result = await client.db(dbName).collection(collectionName).findOne(user, projection);

    const startTime = result.workedDays[0].shift.timeInNum;
    console.log("Start time:", startTime, typeof(startTime))

    const endTime = result.workedDays[0].shift.timeOutNum;
    console.log("End time: ", endTime, typeof(endTime))

    const timeDifferenceInSeconds = (endTime - startTime) / 1000;
    console.log("Time difference in seconds: ", timeDifferenceInSeconds);
    const workedHours = timeDifferenceInSeconds / 3600;
    console.log("Worked hours: ", workedHours);
    const workedHoursFixed = workedHours.toFixed(2);
    console.log("Worked hours fixed: ", workedHoursFixed)

    const update = {
      $set: {
        'workedDays.$[day].shift.workedHours': parseFloat(workedHoursFixed),
      },
    };

    const options = { arrayFilters: [{ 'day.shift.workedHours': { $exists: false } }] };

    await client.db(dbName).collection(collectionName).updateOne(user, update, options);
  } catch (e) {
    console.error('Error: ', e);
    throw e;
  }
}


async function deleteUserById(client, userId) {
    const filter = { _id: userId };
  
    // Delete the record with the specified id
    const result = await client.db(dbName).collection(collectionName).deleteOne(filter);
  
    if (result.deletedCount === 1) {
      console.log(`Record with id ${userId} deleted successfully`);
    } else {
      console.log(`No record found with id ${userId}`);
    }
}

export {
  timeIn,
  timeOut,
  calculateWorkedHours,
  createUser,
  queryAllRecords,
  deleteUserById,
};