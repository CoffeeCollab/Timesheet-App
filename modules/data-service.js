import {
  client,
  dbName,
  collectionName,
  connectToDatabase,
} from "./database.js";

// Call the connectToDatabase function to establish the connection
// connectToDatabase();

// Create new user
async function addNewUser(client, userId) {
  const result = await client
    .db(dbName)
    .collection(collectionName)
    .insertOne({ _id: userId });

  console.log(`${result._id} new user(s) created in hoursRecords database`);
}

async function queryAllRecords(client) {
  const cursor = client.db(dbName).collection(collectionName).find();
  const allRecords = await cursor.toArray();

  console.log(allRecords);
}

async function checkLastShift(client, userId) {
  // Check if the user timed-out the last shift
  const user = { _id: userId };
  const projection = { workedDays: { $slice: -1 } };
  const result = await client
    .db(dbName)
    .collection(collectionName)
    .findOne(user, projection);
  if (result.workedDays != undefined) {
    const workedDaysArray = result.workedDays;
    const index = workedDaysArray.length - 1;

    return result.workedDays[index].shift;
  } else {
    return null;
  }
}

async function timeIn(client, userId) {
  const currentDate = new Date();
  const timeInNum = currentDate.getTime();

  const user = { _id: userId };
  const update = {
    $push: {
      workedDays: {
        shift: {
          fullDateIn: currentDate,
          timeInNum: timeInNum,
        },
      },
    },
  };

  await client.db(dbName).collection(collectionName).updateOne(user, update);
}

async function breakIn(client, userId) {
  const currentDate = new Date();
  const breakInNum = currentDate.getTime();
  const user = { _id: userId };

  const update = {
    $set: {
      "workedDays.$[day].shift.fullDateBreakIn": currentDate,
      "workedDays.$[day].shift.breakInNum": breakInNum,
    },
  };

  await client.db(dbName).collection(collectionName).updateOne(user, update);
}

async function breakOut(client, userId) {
  const currentDate = new Date();
  const breakOutNum = currentDate.getTime();
  const user = { _id: userId };

  const update = {
    $push: {
      workedDays: {
        shift: {
          fullBreakOut: currentDate,
          breakOutNum: breakOutNum,
        },
      },
    },
  };

  await client.db(dbName).collection(collectionName).updateOne(user, update);
}

async function timeOut(client, userId) {
  const currentDate = new Date();
  const timeOutNum = currentDate.getTime();

  const user = { _id: userId };
  const update = {
    $set: {
      "workedDays.$[day].shift.fullDateOut": currentDate,
      "workedDays.$[day].shift.timeOutNum": timeOutNum,
    },
  };
  const options = {
    arrayFilters: [{ "day.shift.timeOut": { $exists: false } }],
  };

  const result = await client
    .db(dbName)
    .collection(collectionName)
    .updateOne(user, update, options);

  console.log(result);
  console.log("time-out recorded");

  await calculateWorkedHours(client, userId);
}

async function calculateWorkedHours(client, userId) {
  try {
    const user = { _id: userId };
    const projection = { workedDays: { $slice: -1 } };
    const result = await client
      .db(dbName)
      .collection(collectionName)
      .findOne(user, projection);
    const workedDaysArray = result.workedDays;
    const index = workedDaysArray.length - 1;

    const startTime = result.workedDays[index].shift.timeInNum;
    console.log("Start time:", startTime, typeof startTime);

    const endTime = result.workedDays[index].shift.timeOutNum;
    console.log("End time: ", endTime, typeof endTime);

    const timeDifferenceInSeconds = (endTime - startTime) / 1000;
    console.log("Time difference in seconds: ", timeDifferenceInSeconds);
    const workedHours = timeDifferenceInSeconds / 3600;
    console.log("Worked hours: ", workedHours);
    const workedHoursFixed = workedHours.toFixed(2);
    console.log("Worked hours fixed: ", workedHoursFixed);

    const update = {
      $set: {
        "workedDays.$[day].shift.workedHours": parseFloat(workedHoursFixed),
      },
    };

    const options = {
      arrayFilters: [{ "day.shift.workedHours": { $exists: false } }],
    };

    await client
      .db(dbName)
      .collection(collectionName)
      .updateOne(user, update, options);
  } catch (e) {
    console.error("Error: ", e);
    throw e;
  }
}

async function deleteUserById(client, userId) {
  const filter = { _id: userId };

  // Delete the record with the specified id
  const result = await client
    .db(dbName)
    .collection(collectionName)
    .deleteOne(filter);

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
  addNewUser,
  queryAllRecords,
  deleteUserById,
  checkLastShift,
  breakIn,
  breakOut,
};
