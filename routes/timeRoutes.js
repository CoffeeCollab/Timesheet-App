import express from "express";
import bodyParser from "body-parser";
import { client } from "../modules/database.js";
import {
  timeIn,
  timeOut,
  checkLastShift,
  breakIn,
  breakOut,
} from "../modules/data-service.js";
import { checkUser } from "../middleware/authMiddleware.js";

const timeRouter = express.Router();

timeRouter.use(bodyParser.urlencoded({ extended: true }));

timeRouter.post("/time-in", checkUser, async (req, res) => {
  const userId = res.locals.user._id;
  console.log(userId);

  const lastShift = await checkLastShift(client, userId);
  if (lastShift) {
    console.log(`Last shift ${lastShift}`);
    if (lastShift.workedHours === undefined) {
      console.log(`Last shift worked hours ${lastShift.workedHours}`);
      return res
        .status(400)
        .json({ message: "Previous shift time-out hasn't been recorded" });
    }
  }

  try {
    await timeIn(client, userId);
    res.status(200).json({ message: "Time-in recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

timeRouter.post("/break-in", checkUser, async (req, res) => {
  const userId = res.locals.user._id;

  // const shiftCheck = await checkLastShift(client, userId);
  const lastShift = await checkLastShift(client, userId);
  if (!lastShift || lastShift === undefined) {
    return res
      .status(400)
      .json({ message: "You haven't started a shift yet." });
  } else {
    if (lastShift.shift.timeInNum === undefined) {
      return res
        .status(400)
        .json({ message: "You haven't started a shift yet." });
    } else if (lastShift.shift.workedHours != undefined) {
      return res
        .status(400)
        .json({ message: "Your shift is over, please start a new one" });
    } else if (lastShift.shift.timeOutNum != undefined) {
      return res
        .status(400)
        .json({ message: "You already had your break, go back to work" });
    } else if (lastShift.shift.breakInNum != undefined) {
      return res
        .status(400)
        .json({ message: "You already already started your break" });
    }
  }

  try {
    await breakIn(client, userId);
    res.status(200).json({ message: "Break-in recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

timeRouter.post("/break-out", checkUser, async (req, res) => {
  const userId = res.locals.user._id;
  const lastShift = await checkLastShift(client, userId);

  if (lastShift) {
    if (lastShift.shift.breakInNum === undefined) {
      return res
        .status(400)
        .json({ message: "You haven't started your break yet." });
    } else if (lastShift.shift.timeOutNum != undefined) {
      return res
        .status(400)
        .json({ message: "You haven't started your shift yet." });
    } else if (lastShift.shift.breakOutNum != undefined) {
      return res
        .status(400)
        .json({ message: "You already finishied your break" });
    }
  } else {
    return res
      .status(400)
      .json({ message: "You haven't started your shift yet." });
  }

  try {
    await breakOut(client, userId);
    res.status(200).json({ message: "Break-out recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

timeRouter.post("/time-out", checkUser, async (req, res) => {
  const userId = res.locals.user._id;

  const lastShift = await checkLastShift(client, userId);

  if (!lastShift || lastShift.timeOutNum) {
    return res.status(400).json({
      message: "Please start a new shift",
    });
  } else if (
    lastShift.breakInNum != undefined &&
    lastShift.breakOutNum === undefined
  ) {
    return res
      .status(400)
      .json({ message: "You didn't finish your break. Time-out anyway?" });
  } else if (!lastShift) {
    return res.status(400).json({ message: "Please start your shift" });
  }

  try {
    await timeOut(client, userId);
    res.status(200).json({ message: "Time-out recorded successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default timeRouter;
