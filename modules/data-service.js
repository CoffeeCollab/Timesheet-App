import { client, dbName, collectionName } from "./database.js";

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

async function getUser(client, userId) {
  const user = { _id: userId };
  return await client.db(dbName).collection(collectionName).findOne(user);
}

async function getLastShiftIndex(client, userId) {
  const userData = await getUser(client, userId);
  return userData.workedDays ? userData.workedDays.length - 1 : null;
}

async function checkLastShift(client, userId) {
  const userData = await getUser(client, userId);
  const index = await getLastShiftIndex(client, userId);
  return userData.workedDays ? userData.workedDays[index] : null;
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
      "workedDays.$[day].shift.fullBreakIn": currentDate,
      "workedDays.$[day].shift.breakInNum": breakInNum,
    },
  };
  const options = {
    arrayFilters: [{ "day.shift": { $exists: true } }],
    multi: true,
  };

  await client
    .db(dbName)
    .collection(collectionName)
    .updateOne(user, update, options);
}

async function breakOut(client, userId) {
  const currentDate = new Date();
  const breakInNum = currentDate.getTime();
  const user = { _id: userId };

  const update = {
    $set: {
      "workedDays.$[day].shift.fullBreakOut": currentDate,
      "workedDays.$[day].shift.breakOutNum": breakInNum,
    },
  };
  const options = {
    arrayFilters: [{ "day.shift": { $exists: true } }],
    multi: true,
  };

  await client
    .db(dbName)
    .collection(collectionName)
    .updateOne(user, update, options);
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

// async function calculateBreakTime(client, userId) {
//   const userData = getUser(client, userId);
//   console.log(JSON.stringify(userData));
//   const index = await getLastShiftIndex(client, userId);
//   console.log(index);

//   const breakIn = userData.workedDays[index].shift.breakInNum;
//   console.log(breakIn);

//   const breakOut = !userData.workedDays[index].shift.breakOutNum
//     ? breakIn / 1000 / 60 + 30
//     : userData.workedDays[index].shift.breakOutNum;

//   console.log(breakOut);

//   const breakDiffInSeconds = (breakOut - breakIn) / 1000;
//   console.log(breakDiffInSeconds);

//   const breakInDiff = breakDiffInSeconds / 3600;

//   return breakInDiff.toFixed(2);
// }

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

    const breakIn = result.workedDays[index].shift.breakInNum;
    console.log("Break in time: ", breakIn, typeof breakIn);

    const breakOut = result.workedDays[index].shift.breakOutNum;
    console.log("Break out time: ", breakOut, typeof breakOut);

    const breakTimeInSec = (breakOut - breakIn) / 1000;
    const breakTimeInHours = breakTimeInSec / 3600;
    const breakTime = breakTimeInHours.toFixed(2);

    const timeDifferenceInSeconds = (endTime - startTime) / 1000;
    console.log("Time difference in seconds: ", timeDifferenceInSeconds);
    const workedHours = timeDifferenceInSeconds / 3600;
    console.log("Worked hours: ", workedHours);
    const workedHoursFixed = workedHours.toFixed(2) - breakTime;
    console.log("Worked hours fixed: ", workedHoursFixed);

    const update = {
      $set: {
        "workedDays.$[day].shift.breakTime": parseFloat(breakTime),
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
